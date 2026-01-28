// drizzle.config.ts

import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';

// Load .env.local
config({ path: '.env.local' });

export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;
