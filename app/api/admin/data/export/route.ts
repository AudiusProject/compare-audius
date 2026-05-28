// app/api/admin/data/export/route.ts
//
// GET → returns the full admin dataset as a downloadable JSON file.

import { requireAuth, errorResponse } from '@/lib/api-helpers';
import { buildExport } from '@/lib/data-io';

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const data = await buildExport();
    const body = JSON.stringify(data, null, 2);
    const stamp = new Date().toISOString().slice(0, 10);

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="compare-audius-data-${stamp}.json"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('Export failed:', err);
    return errorResponse('Export failed', 500);
  }
}
