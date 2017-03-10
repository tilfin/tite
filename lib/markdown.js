'use strict';

const fm = require('front-matter');
const showdown  = require('showdown');
const converter = new showdown.Converter();


module.exports = function markdown(mdText) {
  const ctn = fm(mdText);
  ctn.html = converter.makeHtml(ctn.body);
  return ctn;
}
