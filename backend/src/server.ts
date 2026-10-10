import { createApp } from './app';
import { env } from './config/env';
import { closeDbPool } from './config/database';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`Judicial Case Management Backend running on port ${env.PORT} [${env.NODE_ENV}]`);
});

// Graceful shutdown handling
const shutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await closeDbPool();
      console.log('Database connection pool closed.');
    } catch (err) {
      console.error('Error closing database pool:', err);
    }
    process.exit(0);
  });

  // Force close after 5 seconds if lingering
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 5000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export { server };
