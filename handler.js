module.exports = (resource, isWs) => async (req, res, isQuery) => {
  let method, endpoint;

  // Handle Websocket request
  if (isWs) {
    try {
      method = req.method

      // Handle bad request error
      if (!method) {
        return res.emit('error', { code: 400 });
      }

      // Transform connect/disconnect to match service handler signatures
      if (method === 'connection') {
        method = 'onConnect';
      }

      if (method === 'disconnect') {
        method = 'onDisonnect';
      }

      endpoint = resource[method];

      // Only handle for the provided resource

      if (!endpoint) return;

      // Process the request
      const result = await endpoint(req.body);

      if (result?.error) {
        return res.emit('error', { code: result.error.code });
      }

      // Respond with the result
      return res.send(result);
    } catch (error) {
      // Log the error in the console
      console.log('Service Error:', error);

      // Respond with a server error
      return res.emit('error', { code: 500 });
    }
  }

  // Handle HTTP request
  try {
    // Parse request
    const params = isQuery === true ? req.query : req.body;
    const location = req.route.path.replace('*', '');

    method = req.path.replace(location, '');

    // Handle bad request error
    if (!method) {
      return res.status(400).end();
    }

    endpoint = resource[method];

    // Handle not found error
    if (!endpoint) {
      return res.status(404).end();
    }

    // Process the request
    const result = await endpoint(params);

    if (result?.error) {
      return res.status(result.error.code).end(result.error);
    }

    // Respond with the result
    return res.send(result);
  } catch (error) {
    // Log the error in the console
    console.log('Service Error:', error);

    // Respond with a server error
    return res.status(500).end();
  }
};
