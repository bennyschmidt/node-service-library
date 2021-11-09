(() => {
  const handler = require('./handler');
  const http = require('./http');
  const ws = require('./ws');

  module.exports = {
    handler,
    http,
    ws
  };
})();
