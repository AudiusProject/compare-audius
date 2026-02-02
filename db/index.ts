// db/index.ts
// IMPORTANT: Must use @libsql/client/web for Cloudflare Workers
// See: https://developers.cloudflare.com/workers/databases/third-party-integrations/turso/

import { drizzle } from 'drizzle-orm/libsql';
import { createClient, Client as LibsqlClient } from '@libsql/client/web';
import * as schema from './schema';

// Lazy initialization to prevent build-time errors if env vars aren't available
let client: LibsqlClient | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function getClient(): LibsqlClient {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL?.trim();
    const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
    
    if (!url) {
      throw new Error('TURSO_DATABASE_URL env var is not defined');
    }
    
    if (!authToken) {
      throw new Error('TURSO_AUTH_TOKEN env var is not defined');
    }
    
    client = createClient({ url, authToken });
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
