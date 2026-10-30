import { createApp } from './app.js';
import { connectDatabase } from './database/connection.js';
import { config } from './config/env.js';

const startServer = async () => {
  try {
    await connectDatabase();
    const app = createApp();

    const server = app.listen(config.port, () => {
      console.log(`🚀 ShelfSense backend API successfully listening on port ${config.port} [${config.env}]`);
      console.log(`📡 Healthcheck endpoint available at: http://localhost:${config.port}/health`);
    });

    const shutdown = async () => {
      console.log('Received termination signal. Gracefully closing HTTP server...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
