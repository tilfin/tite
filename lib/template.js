'use strict';

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');


class EjsTemplate {
  constructor(filename, rawStr) {
    this._tmpl = ejs.compile(rawStr, { filename });
  }

  render(data) {
    return this._tmpl(data);
  }
}

class TemplateManager {
  constructor(rootDir, opts) {
    this._rootDir = rootDir;
    this._useCache = 'useCache' in opts ? opts.useCache : true;
    this._cache = {};
  }

  get(fileKey, str) {
    if (fileKey && this._useCache) {
      const cached = this._cache[fileKey];
      if (cached) return cached;
    }

    const fileName = path.join(this._rootDir, (fileKey || '_ROOT_') + '.ejs');
    const rawStr = str || fs.readFileSync(fileName, 'utf8');
    const tmpl = new EjsTemplate(fileName, rawStr);

    if (fileKey && this._useCache) {
      this._cache[fileKey] = tmpl;
    }

    return tmpl;
  }
}

module.exports = function template(rootDir, opts) {
  return new TemplateManager(rootDir, opts || {});
}
