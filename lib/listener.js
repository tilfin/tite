'use strict';

const URL  = require('url');
const Content  = require('./content');

class RequestWrapper {
  constructor(req) {
    const url = URL.parse(req.url, true);
    this.method = req.method;
    this.url = req.url;
    this.pathname = url.pathname;
    this.path = url.path;
    this.query = url.query;

    const al = req.headers['accept-language'] || 'en';
    this.lang = al.split(',').map(l => l.split(';')[0]);
  }
}

class ResponseWrapper {
  constructor(res) {
    this._res = res;
  }

  write(result) {
    this.status = result.status || 200;

    if (result.location) {
      this._res.writeHead(this.status, {
        'Location': result.location
      });
      this._res.end();
      return;
    }

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

  const hook = params_.afterHook || function(req, res){
      console.log(req.method + ' ' + req.url + ' - ' + res.status);
    };
  delete params_.afterHook;

  const content = new Content(params_);

  function get(req, res) {
    return content.resolve(req.pathname, req.lang)
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
    const reqwrap = new RequestWrapper(req);
    const reswrap = new ResponseWrapper(res);

    if (reqwrap.method === 'GET') {
      get(reqwrap, reswrap)
      .then(() => {
        hook(reqwrap, reswrap);
      });
    } else {
      // Method Not Allowed
      reswrap.write({ status: 405, content: '' });
      hook(reqwrap, reswrap);
    }
  };
}
