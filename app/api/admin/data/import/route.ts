// app/api/admin/data/import/route.ts
//
// POST → accepts the uploaded JSON, validates it, and returns a diff against
// the current DB. Does NOT write anything — that's the apply endpoint.

import { NextRequest } from 'next/server';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';
import { parseExport, computeDiff } from '@/lib/data-io';

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return errorResponse('Uploaded file is not valid JSON', 400);
  }

  const { data, errors } = parseExport(raw);
  if (!data) {
    return successResponse({ ok: false, errors });
  }

  const diff = await computeDiff(data);
  return successResponse({ ok: true, errors: [], diff });
}
