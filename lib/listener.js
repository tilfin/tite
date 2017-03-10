'use strict';

const URL  = require('url');
const Content  = require('./content');

class ResponseWrapper {
  constructor(res) {
    this._res = res;
  }

  write(result) {
    this.status = result.status || 200;
    this.type = result.type || 'text/html;charset=UTF-8';
    this.len = typeof result.content === 'string'
      ? Buffer.byteLength(result.content, 'utf8')
      : result.content.length;

    this._res.writeHead(this.status, {
      'Content-Type': this.type,
      'Content-Length': this.len
    });
    this._res.end(result.content);
  }
}


module.exports = function listener(params) {
  const params_ = params || {};

  const hook = params_.afterHook || function(url, req, res){
      console.log(req.method + ' ' + req.url + ' - ' + res.status);
    };
  delete params_.afterHook;

  const content = new Content(params_);

  function get(req, res) {
    return content.resolve(req.pathname)
    .then(result => {
      res.write(result);
    })
    .catch(err => {
      console.error(err.stack);

      const serverError = 'Internal Server Error';
      res.write({
        status: 500,
        type: 'text/plain',
        content: serverError
      });
    });
  }

  return (req, res) => {
    const url = URL.parse(req.url, true);
    const reswrap = new ResponseWrapper(res);

    if (req.method === 'GET') {
      get(url, reswrap)
      .then(() => {
        hook(url, req, reswrap);
      });
    } else {
      // Method Not Allowed
      reswrap.write({ status: 405, content: '' });
      hook(url, req, reswrap);
    }
  };
}
