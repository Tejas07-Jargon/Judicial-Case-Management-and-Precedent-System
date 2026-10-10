import { Router, Request, Response } from 'express';
import { checkDbHealth } from '../config/database';

export const healthRouter = Router();

/**
 * GET /api/health
 * Simple server health check indicating the Express process is running.
 */
healthRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'Judicial Case Management Backend',
  });
});

/**
 * GET /api/health/db
 * Database health check executing a minimal SELECT 1 on the pool.
 */
healthRouter.get('/db', async (_req: Request, res: Response) => {
  const dbHealth = await checkDbHealth();

  if (dbHealth.ok) {
    res.status(200).json({
      status: 'UP',
      database: 'CONNECTED',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: 'DOWN',
      database: 'UNAVAILABLE',
      error: dbHealth.message || 'Database unreachable',
      timestamp: new Date().toISOString(),
    });
  }
});
