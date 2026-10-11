import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'DBMS_DA2_CONCEPT',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  multipleStatements: true
};

let pool = null;
let isConnected = false;
let lastError = null;

export function getPool() {
  if (!pool) {
    try {
      pool = mysql.createPool(dbConfig);
    } catch (err) {
      console.error('[MySQL Pool Error]', err.message);
      lastError = err.message;
    }
  }
  return pool;
}

export async function testConnection() {
  try {
    const p = getPool();
    const conn = await p.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    isConnected = true;
    lastError = null;
    console.log(`[MySQL] Successfully connected to database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);
    return { connected: true };
  } catch (err) {
    isConnected = false;
    lastError = err.message;
    console.warn(`[MySQL Notice] Could not connect to MySQL (${err.code || err.message}).`);
    console.warn(`[MySQL Notice] Tip: Update credentials in server/.env or server/db.js. Operating in resilient responsive mode.`);
    return { connected: false, error: err.message, code: err.code };
  }
}

export function getStatus() {
  return {
    connected: isConnected,
    lastError,
    config: {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port
    }
  };
}

export async function executeQuery(sql, params = []) {
  const p = getPool();
  return await p.query(sql, params);
}

export default getPool();
