const express = require('express');
const http = require('http');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables first
dotenv.config();

try {
  // Config ve logger
  const config = require('./config');
  const { logInfo, logError } = require('./config/logger');

  // Middleware
  const { errorHandler } = require('./middleware/error');

  // Routes
  const routes = require('./routes');

  // Services
  const socketService = require('./services/socket');

  // Create Express app
  const app = express();
  const server = http.createServer(app);

  // Initialize WebSocket
  socketService.initialize(server);

  // Middleware
  app.use(cors({
    origin: config.server.frontendUrl || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }));

  app.use(express.json());
  app.use(fileUpload({
    limits: { 
      fileSize: 25 * 1024 * 1024 // 25MB
    },
    abortOnLimit: true
  }));

  // Test sayfası (sadece development ortamında)
  if (config.server.env === 'development') {
    app.get('/test', (req, res) => {
      res.sendFile(path.join(__dirname, '../test/index.html'));
    });
  }

  // Routes
  app.use('/api', routes);

  // Error handling
  app.use(errorHandler);

  // Start server
  const PORT = config.server.port || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${config.server.env || 'development'}`);
    console.log(`Frontend URL: ${config.server.frontendUrl || 'http://localhost:5173'}`);

    if (config.server.env === 'development') {
      console.log(`Test page available at: http://localhost:${PORT}/test`);
    }
  });

} catch (error) {
  console.error('Application startup error:', error);
  process.exit(1);
}
