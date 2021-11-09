module.exports = (
  httpRequests = {
    GET: {},
    POST: {},
    PUT: {},
    DELETE: {}
  }
) => {
  const handle = require('./handler');

  // Wrap endpoints in a validation handler
  return {
    type: 'http',
    onHttpGet: handle(httpRequests.GET),
    onHttpPost: handle(httpRequests.POST),
    onHttpPut: handle(httpRequests.PUT),
    onHttpDelete: handle(httpRequests.DELETE),

    // Search is a GET with a query, pass true for isQuery arg
    onHttpSearch: (req, res) => handle(httpRequests.GET)(req, res, true)
  };
};
