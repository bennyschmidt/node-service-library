module.exports = (
  wsRequests = {
    REQUEST: {},
    LIFECYCLE: {}
  }
) => {
  const handle = require('./handler');

  // Wrap endpoints in a validation handler
  return {
    type: 'ws',
    onWsReady: wsRequests.LIFECYCLE.onReady,
    onWsConnect: handle(wsRequests.LIFECYCLE, true),
    onWsDisconnect: handle(wsRequests.LIFECYCLE, true),
    onWsRequest: handle(wsRequests.REQUEST, true)
  };
};
