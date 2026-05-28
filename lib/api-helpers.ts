// lib/api-helpers.ts

import { auth } from '@/auth';
import type { Session } from 'next-auth';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { platforms } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Returns the current session, or a mock dev session when BOTH gates are set:
 *   1. NODE_ENV !== 'production'   (hard build-time guard)
 *   2. DEV_SKIP_AUTH === 'true'    (explicit opt-in per machine)
 *
 * Both are required so the bypass cannot ship to production even if the env
 * var leaks. Set DEV_SKIP_AUTH=true in .env.local to use it.
 */
export async function getEffectiveSession(): Promise<Session | null> {
  if (process.env.NODE_ENV !== 'production' && process.env.DEV_SKIP_AUTH === 'true') {
    const devSession: Session = {
      user: {
        id: 'dev-user',
        name: 'Dev User',
        email: process.env.DEV_AUTH_EMAIL ?? 'dev@localhost',
        image: null,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    return devSession;
  }
  return (await auth()) ?? null;
}

export async function requireAuth() {
  const session = await getEffectiveSession();

  if (!session) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  return { session };
}

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Revalidate all public comparison pages dynamically.
 * Fetches all published competitor slugs from the database and revalidates each route.
 */
export async function revalidatePublicPages() {
  // Always revalidate the home page
  revalidatePath('/');
  
  // Fetch all published competitor slugs dynamically
  const competitors = await db.select({ slug: platforms.slug })
    .from(platforms)
    .where(
      and(
        eq(platforms.isAudius, false),
        eq(platforms.isDraft, false)
      )
    );
  
  // Revalidate each competitor's page
  for (const competitor of competitors) {
    revalidatePath(`/${competitor.slug}`);
  }
}
