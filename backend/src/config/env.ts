import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const schema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(8),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-'),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = schema.parse(process.env);
