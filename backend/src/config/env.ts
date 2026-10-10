import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().default('DBMS_DA2_CONCEPT'),
  DB_CONNECTION_LIMIT: z.coerce.number().default(10),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Safe console error without exposing secrets
  console.error('Invalid environment configuration:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
