const http = require('http');
const app = require('./src/app');
const sequelize = require('./src/config/database');
const env = require('./src/config/env');
const { setupWebSocket } = require('./src/ws');

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Sync models (don't alter/drop in production)
    await sequelize.sync({ alter: false });
    console.log('✓ Database models synchronized');

    // Start server with WebSocket support
    const port = env.port;
    const server = http.createServer(app);
    
    // Setup WebSocket
    setupWebSocket(server);

    server.listen(port, () => {
      console.log(`✓ Server running on port ${port}`);
      console.log(`✓ API: http://localhost:${port}/api/v1`);
      console.log(`✓ WebSocket: ws://localhost:${port}/ws`);
    });
  } catch (error) {
    console.error('✗ Server startup error:', error);
    process.exit(1);
  }
};

startServer();
