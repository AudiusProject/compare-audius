// app/api/comparisons/route.ts

import { NextRequest } from 'next/server';
import { db } from '@/db';
import { comparisons } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse, revalidatePublicPages } from '@/lib/api-helpers';
import { nanoid } from 'nanoid';

// GET /api/comparisons?featureId=xxx
export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;
  
  const { searchParams } = new URL(request.url);
  const featureId = searchParams.get('featureId');
  
  let results;
  if (featureId) {
    results = await db.select().from(comparisons).where(eq(comparisons.featureId, featureId));
  } else {
    results = await db.select().from(comparisons);
  }
  
  return successResponse(results);
}

// POST /api/comparisons - Bulk upsert comparisons
// Body: { items: [{ platformId, featureId, status, displayValue?, context? }] }
export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;
  
  try {
    const { items } = await request.json();
    
    if (!Array.isArray(items)) {
      return errorResponse('Items must be an array');
    }
    
    for (const item of items) {
      const { platformId, featureId, status, displayValue, context } = item;
      
      // Check if comparison exists
      const existing = await db.select().from(comparisons).where(
        eq(comparisons.platformId, platformId)
      );
      const found = existing.find(c => c.featureId === featureId);
      
      if (found) {
        // Update
        await db.update(comparisons)
          .set({
            status,
            displayValue: displayValue || null,
            context: context || null,
            updatedAt: new Date(),
          })
          .where(eq(comparisons.id, found.id));
      } else {
        // Insert
        await db.insert(comparisons).values({
          id: nanoid(),
          platformId,
          featureId,
          status,
          displayValue: displayValue || null,
          context: context || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
    
    await revalidatePublicPages();
    
    return successResponse({ success: true });
  } catch (err) {
    console.error('Bulk comparison error:', err);
    return errorResponse('Failed to save comparisons', 500);
  }
}
