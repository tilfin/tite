'use strict';

const file = require('../utils/file');

const fm = require('front-matter');
const showdown  = require('showdown');
const converter = new showdown.Converter();

module.exports = function markdownResolve(fileName, tmplMngr) {
  const filePath = fileName + '.md';

  return file.readText(filePath)
  .then(data => {
    const ctn = markdown(data);
    if (!ctn.attributes.template) {
      return {
        type: 'html',
        content: ctn.html
      };
    }

    return tmplMngr.get(ctn.attributes.template)
    .then(tmpl => {
      Object.assign(ctn.attributes, { content: ctn.html });
      return {
        type: 'html',
        content: tmpl.render(ctn.attributes)
      };
    });
  });
}

function markdown(mdText) {
  const ctn = fm(mdText);
  ctn.html = converter.makeHtml(ctn.body);
  return ctn;
}
