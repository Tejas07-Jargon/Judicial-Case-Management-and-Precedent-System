import express, { Express } from 'express';
import cors from 'cors';
import { healthRouter } from './routes/healthRoutes';
import { judicialRouter } from './routes/judicialRoutes';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Express {
  const app = express();

  // Basic middleware
  app.use(cors());
  app.use(express.json());

  // Mount API routers
  app.use('/api/health', healthRouter);
  app.use('/api/v1', judicialRouter);

  // Global error handler
  app.use(errorHandler);

  return app;
}
