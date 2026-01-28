// lib/api-helpers.ts

import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { platforms } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function requireAuth() {
  const session = await auth();
  
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
