// app/api/platforms/[id]/route.ts

import { NextRequest } from 'next/server';
import { db } from '@/db';
import { platforms } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse, revalidatePublicPages } from '@/lib/api-helpers';

// GET /api/platforms/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;
  
  const { id } = await params;
  const platform = await db.select().from(platforms).where(eq(platforms.id, id));
  
  if (!platform[0]) {
    return errorResponse('Platform not found', 404);
  }
  
  return successResponse(platform[0]);
}

// PUT /api/platforms/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;
  
  const { id } = await params;
  
  try {
    const body = await request.json();
    const { name, slug, logo, isAudius, isDraft } = body;
    
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (logo !== undefined) updateData.logo = logo;
    if (isAudius !== undefined) updateData.isAudius = isAudius;
    if (isDraft !== undefined) updateData.isDraft = isDraft;
    
    await db.update(platforms).set(updateData).where(eq(platforms.id, id));
    
    // Revalidate public pages if publishing
    if (isDraft === false) {
      await revalidatePublicPages();
    }
    
    const updated = await db.select().from(platforms).where(eq(platforms.id, id));
    return successResponse(updated[0]);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('UNIQUE constraint failed')) {
      return errorResponse('A platform with this slug already exists', 409);
    }
    return errorResponse('Failed to update platform', 500);
  }
}

// DELETE /api/platforms/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;
  
  const { id } = await params;
  
  // Check if it's Audius (can't delete)
  const platform = await db.select().from(platforms).where(eq(platforms.id, id));
  if (platform[0]?.isAudius) {
    return errorResponse('Cannot delete Audius platform', 400);
  }
  
  // Delete (comparisons will cascade due to foreign key)
  await db.delete(platforms).where(eq(platforms.id, id));
  
  await revalidatePublicPages();
  
  return successResponse({ success: true });
}
