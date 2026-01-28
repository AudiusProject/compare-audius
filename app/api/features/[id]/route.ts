// app/api/features/[id]/route.ts

import { NextRequest } from 'next/server';
import { db } from '@/db';
import { features } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';
import { revalidatePath } from 'next/cache';

// GET /api/features/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;
  
  const { id } = await params;
  const feature = await db.select().from(features).where(eq(features.id, id));
  
  if (!feature[0]) {
    return errorResponse('Feature not found', 404);
  }
  
  return successResponse(feature[0]);
}

// PUT /api/features/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;
  
  const { id } = await params;
  
  try {
    const body = await request.json();
    const { name, slug, description, sortOrder, isDraft } = body;
    
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isDraft !== undefined) updateData.isDraft = isDraft;
    
    await db.update(features).set(updateData).where(eq(features.id, id));
    
    if (isDraft === false) {
      revalidatePath('/');
      revalidatePath('/soundcloud');
      revalidatePath('/spotify');
    }
    
    const updated = await db.select().from(features).where(eq(features.id, id));
    return successResponse(updated[0]);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('UNIQUE constraint failed')) {
      return errorResponse('A feature with this slug already exists', 409);
    }
    return errorResponse('Failed to update feature', 500);
  }
}

// DELETE /api/features/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;
  
  const { id } = await params;
  
  await db.delete(features).where(eq(features.id, id));
  
  revalidatePath('/');
  revalidatePath('/soundcloud');
  revalidatePath('/spotify');
  
  return successResponse({ success: true });
}
