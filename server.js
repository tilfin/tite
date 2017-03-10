'use strict';

const http = require('http');
const listener = require('./lib/listener');

function myServer(params) {
  const server = http.createServer(listener(params));

  const port = process.env.PORT || params.port || 8080;
  server.listen(port, () => {
    console.info('Server started on port:%d', port);
  });

  var isClosing = false;
  function dispose(exitCode) {
    if (isClosing) return;
    isClosing = true;

    console.log('Server stopping...');
    server.close(() => {
      console.info('Server stopped');
      process.exit(exitCode);
    });
  }

  process.on('SIGTERM', () => {
    console.log('Received SIGTERM');
    dispose(0);
  });

  process.on('SIGINT', () => {
    console.log('Received SIGINT');
    dispose(0);
  });

  return server;
}

module.exports = myServer;

if (!module.parent) {
  myServer({});
}
