'use strict';

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const tmplCache = {};

exports.get = function(path, rootDir) {
  const cached = tmplCache[path];
  if (cached) return cached;

  const filePath = path.join(rootDir, path + '.ejs');
  const str = fs.readFileSync(filePath, 'utf8')
  const tmpl = tmplCache[path] = ejs.compile(str, { filename: filePath });
  return tmpl;
}
