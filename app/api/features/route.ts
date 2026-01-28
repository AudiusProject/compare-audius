// app/api/features/route.ts

import { NextRequest } from 'next/server';
import { db } from '@/db';
import { features } from '@/db/schema';
import { asc } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';
import { nanoid } from 'nanoid';

// GET /api/features
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;
  
  const allFeatures = await db.select().from(features).orderBy(asc(features.sortOrder));
  return successResponse(allFeatures);
}

// POST /api/features
export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;
  
  try {
    const body = await request.json();
    const { name, slug, description } = body;
    
    if (!name || !slug || !description) {
      return errorResponse('Name, slug, and description are required');
    }
    
    // Auto-calculate sortOrder (place at end of list)
    const allFeatures = await db.select().from(features);
    const maxSortOrder = Math.max(0, ...allFeatures.map(f => f.sortOrder));
    
    const newFeature = {
      id: nanoid(),
      name,
      slug,
      description,
      sortOrder: maxSortOrder + 1,
      isDraft: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.insert(features).values(newFeature);
    
    return successResponse(newFeature, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('UNIQUE constraint failed')) {
      return errorResponse('A feature with this slug already exists', 409);
    }
    return errorResponse('Failed to create feature', 500);
  }
}
