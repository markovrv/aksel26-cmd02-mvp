const WebSocket = require('ws');

/** @type {Set<WebSocket & {userId: string}>} */
const clients = new Set();

let wss = null;

function setupWebSocket(server) {
  wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    // Парсим userId из query-параметра ws://.../?userId=xxx
    const url = new URL(req.url, 'http://localhost');
    const userId = url.searchParams.get('userId');
    ws.userId = userId;

    clients.add(ws);
    console.log(`WS connected: ${userId}, total: ${clients.size}`);

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`WS disconnected: ${userId}, total: ${clients.size}`);
    });

    ws.on('error', (err) => {
      console.error('WS error:', err.message);
    });
  });

  console.log('WebSocket server initialized');
  return wss;
}

function getWsClients() {
  return clients;
}

module.exports = { setupWebSocket, getWsClients };