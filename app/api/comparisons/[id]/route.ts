// app/api/comparisons/[id]/route.ts

import { NextRequest } from 'next/server';
import { db } from '@/db';
import { comparisons } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';
import { revalidatePath } from 'next/cache';

// PUT /api/comparisons/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;
  
  const { id } = await params;
  
  try {
    const body = await request.json();
    const { status, displayValue, context } = body;
    
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (status !== undefined) updateData.status = status;
    if (displayValue !== undefined) updateData.displayValue = displayValue;
    if (context !== undefined) updateData.context = context;
    
    await db.update(comparisons).set(updateData).where(eq(comparisons.id, id));
    
    revalidatePath('/');
    revalidatePath('/soundcloud');
    revalidatePath('/spotify');
    
    const updated = await db.select().from(comparisons).where(eq(comparisons.id, id));
    return successResponse(updated[0]);
  } catch {
    return errorResponse('Failed to update comparison', 500);
  }
}
