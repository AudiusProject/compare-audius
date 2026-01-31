// db/index.ts

import { drizzle } from 'drizzle-orm/libsql';
// Use the web-compatible version for Cloudflare Workers
// This prevents externalization issues with OpenNext Cloudflare
import { createClient } from '@libsql/client/web';
import * as schema from './schema';

// Lazy initialization to prevent build-time errors if env vars aren't available
let client: ReturnType<typeof createClient> | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function getClient() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    
    if (!url) {
      throw new Error('TURSO_DATABASE_URL is not set. Make sure it is configured in your environment variables.');
    }
    
    client = createClient({
      url,
      authToken,
    });
  }
  return client;
}

// Export a proxy that lazily initializes the database
// This ensures the import is at the top level (for bundling) but initialization is lazy
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    if (!dbInstance) {
      dbInstance = drizzle(getClient(), { schema });
    }
    return (dbInstance as any)[prop];
  }
});

export type Database = typeof db;
