'use strict';

const mimeTypes = {
  css:  'text/css',
  js:   'text/javascript',
  json: 'application/json',
  jpeg: 'image/jpeg',
  jpg:  'image/jpeg',
  gif:  'image/gif',
  html: 'text/html',
  ico:  'image/ico',
  mp4:  'video/mp4',
  png:  'image/png',
  webm: 'video/webm',
  webp: 'image/webp'
}

exports.getType = function getType(extname) {
  const ext = extname.substr(1);
  return mimeTypes[ext] || 'application/octet-stream';
}
