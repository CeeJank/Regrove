const { WebSocketServer } = require('ws');

let wss;

module.exports = {
  initSocketService: (server) => {
    // crrates new unnattached websocket server instance
    wss = new WebSocketServer({noServer: true})
    // listen to node server for when 'upgrade' event is called
    server.on('upgrade', (req, socket, head) => {
      // handles conversion of route to ws
      wss.handleUpgrade(req, socket, head, (ws) => {
        //alerts application of new ws connection
        wss.emit('connection', ws, req)
      })
    })
  },
  
}