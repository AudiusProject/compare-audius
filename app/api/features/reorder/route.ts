// app/api/features/reorder/route.ts

import { NextRequest } from 'next/server';
import { db } from '@/db';
import { features } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse, revalidatePublicPages } from '@/lib/api-helpers';

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
    
    await revalidatePublicPages();
    
    return successResponse({ success: true });
  } catch {
    return errorResponse('Failed to reorder features', 500);
  }
}
