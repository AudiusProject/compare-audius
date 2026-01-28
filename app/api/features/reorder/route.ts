// app/api/features/reorder/route.ts

import { NextRequest } from 'next/server';
import { db } from '@/db';
import { features } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';
import { revalidatePath } from 'next/cache';

// POST /api/features/reorder
// Body: { order: [{ id: string, sortOrder: number }] }
export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;
  
  try {
    const { order } = await request.json();
    
    if (!Array.isArray(order)) {
      return errorResponse('Order must be an array');
    }
    
    // Update each feature's sortOrder
    for (const item of order) {
      await db.update(features)
        .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
        .where(eq(features.id, item.id));
    }
    
    revalidatePath('/');
    revalidatePath('/soundcloud');
    revalidatePath('/spotify');
    
    return successResponse({ success: true });
  } catch {
    return errorResponse('Failed to reorder features', 500);
  }
}
