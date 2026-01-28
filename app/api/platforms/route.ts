// app/api/platforms/route.ts

import { NextRequest } from 'next/server';
import { db } from '@/db';
import { platforms } from '@/db/schema';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';
import { nanoid } from 'nanoid';

// GET /api/platforms - List all platforms
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;
  
  const allPlatforms = await db.select().from(platforms);
  return successResponse(allPlatforms);
}

// POST /api/platforms - Create platform
export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;
  
  try {
    const body = await request.json();
    const { name, slug, logo, isAudius = false } = body;
    
    // Validation
    if (!name || !slug || !logo) {
      return errorResponse('Name, slug, and logo are required');
    }
    
    const newPlatform = {
      id: nanoid(),
      name,
      slug,
      logo,
      isAudius,
      isDraft: true, // New platforms start as draft
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.insert(platforms).values(newPlatform);
    
    return successResponse(newPlatform, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('UNIQUE constraint failed')) {
      return errorResponse('A platform with this slug already exists', 409);
    }
    return errorResponse('Failed to create platform', 500);
  }
}
