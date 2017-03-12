'use strict';

const path = require('path');
const file = require('./utils/file');
const template = require('./template');
const mimetype = require('./mimetype');
const markdownResolve = require('./resolvers/markdown');
const redirectResolve = require('./resolvers/redirect');

class Content {
  constructor(config) {
    const cfg = config || {};
    const dir = cfg.dir || {};
    this._wwwDir = dir.www || path.resolve(process.cwd(), 'www');
    this._errDir = dir.errors || path.resolve(process.cwd(), 'errors');
    this._tmplDir = dir.templates || path.resolve(process.cwd(), 'templates');

    console.dir({
      www: this._wwwDir,
      errors: this._errDir,
      templates: this._tmplDir
    });

    this._tmpl = template(this._tmplDir, cfg.template);
  }

  resolve(reqPath, lang) {
    const ext = path.extname(reqPath);

    if (ext.length === 1) { // '.'
      return this._resolveErrorPage(404);

    } else if (ext.length > 1) {
      const contentPath = path.join(this._wwwDir, reqPath);
      return file.readRaw(contentPath)
      .then(data => {
        return {
          status: 200,
          type: mimetype.getType(ext),
          content: data
        }
      })
      .catch(err => {
        if (err.code !== 'ENOENT') throw err;

        return this._resolveErrorPage(404);
      });
    }

    return this._resolveContent(reqPath, lang);
  }

  _resolveContent(filePath, lang) {
    let contentPath = filePath;
    if (contentPath.endsWith('/')) {
      contentPath += 'index';
    }
    contentPath = path.join(this._wwwDir, contentPath);
    return this._resolveHtml(contentPath, lang)
    .catch(err => {
      if (err.code !== 'ENOENT') throw err;

      return this._resolveErrorPage(404);
    });
  }

  _resolveErrorPage(code) {
    const contentPath = path.join(this._errDir, code.toString());
    return this._resolveHtml(contentPath)
    .then(result => {
      if (result) {
        result.status = code;
        return result;
      }
      throw new Error('');
    })
    .catch(err => {
      return {
        status: code,
        type: 'text/plain',
        content: code.toString()
      }
    });
  }

  _resolveHtml(filePath, lang) {
    return file.readText(filePath + '.html')
    .then(data => {
      return {
        type: 'html',
        content: data
      };
    })
    .catch(err => {
      if (err.code !== 'ENOENT') throw err;

      return markdownResolve(filePath, this._tmpl)
    })
    .catch(err => {
      if (err.code !== 'ENOENT') throw err;

      const ejsPath = filePath + '.ejs';
      return file.readText(ejsPath)
      .then(data => {
        return this._tmpl.get(null, data);
      })
      .then(tmpl => {
        return { content: tmpl.render() };
      });
    })
    .catch(err => {
      if (err.code !== 'ENOENT') throw err;

      return redirectResolve(filePath, lang);
    })
  }
}

module.exports = Content;
