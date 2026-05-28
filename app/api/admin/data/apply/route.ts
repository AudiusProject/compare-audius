// app/api/admin/data/apply/route.ts
//
// POST → applies a user-confirmed subset of upserts. The client trims the
// review UI's selections into platforms/features/comparisons arrays and posts
// them here. Rows that exist in the DB but aren't in the payload are left
// untouched — by design, this endpoint never deletes.

import { NextRequest } from 'next/server';
import { requireAuth, successResponse, errorResponse, revalidatePublicPages } from '@/lib/api-helpers';
import { applyImport, type ApplyPayload, type PlatformExport, type FeatureExport, type ComparisonExport } from '@/lib/data-io';

function isPlatform(x: unknown): x is PlatformExport {
  if (!x || typeof x !== 'object') return false;
  const p = x as Record<string, unknown>;
  return (
    typeof p.slug === 'string' &&
    typeof p.name === 'string' &&
    typeof p.logo === 'string' &&
    typeof p.isAudius === 'boolean' &&
    typeof p.isDraft === 'boolean'
  );
}

function isFeature(x: unknown): x is FeatureExport {
  if (!x || typeof x !== 'object') return false;
  const f = x as Record<string, unknown>;
  return (
    typeof f.slug === 'string' &&
    typeof f.name === 'string' &&
    typeof f.description === 'string' &&
    typeof f.sortOrder === 'number' &&
    typeof f.isDraft === 'boolean'
  );
}

function isComparison(x: unknown): x is ComparisonExport {
  if (!x || typeof x !== 'object') return false;
  const c = x as Record<string, unknown>;
  return (
    typeof c.platformSlug === 'string' &&
    typeof c.featureSlug === 'string' &&
    typeof c.status === 'string' &&
    ['yes', 'no', 'partial', 'custom', 'skip'].includes(c.status) &&
    (c.displayValue === null || typeof c.displayValue === 'string') &&
    (c.context === null || typeof c.context === 'string')
  );
}

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Body is not valid JSON', 400);
  }

  if (!body || typeof body !== 'object') return errorResponse('Body must be an object', 400);
  const b = body as Record<string, unknown>;

  const platforms = Array.isArray(b.platforms) ? b.platforms : [];
  const features = Array.isArray(b.features) ? b.features : [];
  const comparisons = Array.isArray(b.comparisons) ? b.comparisons : [];

  if (!platforms.every(isPlatform)) return errorResponse('Invalid platform in payload', 400);
  if (!features.every(isFeature)) return errorResponse('Invalid feature in payload', 400);
  if (!comparisons.every(isComparison)) return errorResponse('Invalid comparison in payload', 400);

  const payload: ApplyPayload = { platforms, features, comparisons };

  try {
    const result = await applyImport(payload);
    await revalidatePublicPages();
    return successResponse({ ok: true, result });
  } catch (err) {
    console.error('Apply failed:', err);
    return errorResponse('Apply failed', 500);
  }
}
