import mysql, { Pool } from 'mysql2/promise';
import { env } from './env';

let pool: Pool | null = null;

/**
 * Returns the MySQL connection pool singleton.
 */
export function getDbPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      waitForConnections: true,
      connectionLimit: env.DB_CONNECTION_LIMIT,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      charset: 'UTF8MB4_0900_AI_CI',
    });
  }
  return pool;
}

/**
 * Gracefully shuts down the database connection pool.
 */
export async function closeDbPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Checks if the database is accessible with a minimal query.
 */
export async function checkDbHealth(): Promise<{ ok: boolean; message?: string }> {
  try {
    const currentPool = getDbPool();
    const [rows] = await currentPool.query('SELECT 1 AS health');
    if (Array.isArray(rows) && rows.length > 0) {
      return { ok: true };
    }
    return { ok: false, message: 'Health check query returned unexpected result' };
  } catch (error: any) {
    // Redact connection parameters and passwords, return safe error classification
    const safeMessage = error.code ? `Database error [${error.code}]` : 'Database connection unavailable';
    return { ok: false, message: safeMessage };
  }
}
