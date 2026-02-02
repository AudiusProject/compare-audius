// lib/origin.ts

import { headers } from 'next/headers';

/**
 * Build the request origin from forwarded headers.
 * Falls back to null if no host is available.
 */
export function getRequestOrigin(): string | null {
  const headerList = headers();
  const proto = headerList
    .get('x-forwarded-proto')
    ?.split(',')[0]
    ?.trim() || 'http';
  const host =
    headerList.get('x-forwarded-host')?.split(',')[0]?.trim() ||
    headerList.get('host')?.split(',')[0]?.trim();

  if (!host) {
    return null;
  }

  return `${proto}://${host}`;
}
