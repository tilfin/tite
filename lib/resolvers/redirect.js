'use strict';

const yaml = require('js-yaml');
const file = require('../utils/file');

module.exports = function redirectResolve(fileName, lang) {
  const filePath = fileName + '.redirect';

  return file.readText(filePath)
  .then(data => {
    return yaml.safeLoad(data);
  })
  .then(data => {
    const status = data.status || 302;
    const loc = data.location;
    if (typeof loc === 'string') {
      return {
        status,
        location: loc
      };
    } else {
      return {
        status,
        location: getLocationByLang(loc, lang)
      };
    }
  });
}

function getLocationByLang(loc, lang) {
  for (let lng of lang) {
    if (lng in loc) return loc[lng];
  }

  // default is first value
  for (let key in loc) {
    return loc[key];
  }
}
