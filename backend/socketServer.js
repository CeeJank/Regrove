const http = require('http');
const app = require('./server.js'); //bring express http blue print(server,js)
const { initSocketService } = require('./services/socketService'); // bring in WS engine

// Create a raw, generic Node.js server wrapper and hand it our Express app
const server = http.createServer(app);

// Pass that raw server to our WebSocket initializer
initSocketService(server);

// Start the server on a single port
server.listen(5000);