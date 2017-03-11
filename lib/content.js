'use strict';

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const file = require('./file');
const markdown = require('./markdown');
const template = require('./template');
const mimetype = require('./mimetype');


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

  resolve(reqPath) {
    const ext = path.extname(reqPath);

    if (ext.length === 1) {
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
        return this._resolveErrorPage(404);
      });
    }

    return this._resolveContent(reqPath);
  }

  _resolveContent(filePath) {
    let contentPath = filePath;
    if (contentPath.endsWith('/')) {
      contentPath += 'index';
    }
    contentPath = path.join(this._wwwDir, contentPath);
    return this._resolveHtml(contentPath)
    .catch(err => {
      if (err.code === 'ENOENT') {
        return this._resolveErrorPage(404);
      }
      throw err;
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

  _resolveHtml(filePath) {
    return file.readText(filePath + '.html')
    .then(data => {
      return {
        type: 'html',
        content: data
      };
    })
    .catch(err => {
      if (err.code !== 'ENOENT') throw err;

      const mdPath = filePath + '.md';
      return file.readText(mdPath)
      .then(data => {
        const ctn = markdown(data);

        if (ctn.attributes.template) {
          const tmpl = this._tmpl.get(ctn.attributes.template);
          Object.assign(ctn.attributes, { content: ctn.html });
          ctn.html = tmpl.render(ctn.attributes);
        }

        return { content: ctn.html };
      });
    })
    .catch(err => {
      console.log(err.stack);
      if (err.code !== 'ENOENT') throw err;

      const ejsPath = filePath + '.ejs';
      return file.readText(ejsPath)
      .then(data => {
        const tmpl = this._tmpl.get(null, data);
        return { content: tmpl.render() };
      });
    });
  }
}

module.exports = Content;
