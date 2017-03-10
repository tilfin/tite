'use strict';

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const tmplCache = {};

exports.get = function(pathKey, rootDir) {
  const cached = tmplCache[pathKey];
  if (cached) return cached;

  const filePath = path.join(rootDir, pathKey + '.ejs');
  const str = fs.readFileSync(filePath, 'utf8')
  const tmpl = tmplCache[pathKey] = ejs.compile(str, { filename: filePath });
  return tmpl;
}
