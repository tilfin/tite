'use strict';

const fs = require('fs');


exports.readText = function readText(filePath) {
  //console.log('Reading ' + filePath);
  return new Promise(function(resolve, reject) {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) reject(err)
      else resolve(data);
    });
  });
}

exports.readRaw = function readRaw(filePath) {
  //console.log('Reading ' + filePath);
  return new Promise(function(resolve, reject) {
    fs.readFile(filePath, (err, data) => {
      if (err) reject(err)
      else resolve(data);
    });
  });
}
