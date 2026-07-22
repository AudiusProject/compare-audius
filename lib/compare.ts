// lib/compare.ts
//
// URL semantics for comparison pages. A comparison lives at a single path
// segment of competitor slugs joined by `-vs-` (Audius is implicit and always
// column 1): /soundcloud, /spotify-vs-soundcloud, /bandcamp-vs-skio-vs-spotify.
//
// Client-safe: no DB imports. Shared by route handlers, metadata, and the
// interactive ComparisonBuilder.

import { CURATED_COMBOS, MAX_COMPETITORS } from './constants';

export const VS_SEPARATOR = '-vs-';

/** Reserved slug — Audius is implicit in every comparison URL. */
export const AUDIUS_SLUG = 'audius';

/**
 * Split a raw path segment into competitor slugs.
 * "spotify-vs-soundcloud" → ["spotify", "soundcloud"]
 */
export function parseCompareSegment(segment: string): string[] {
  return decodeURIComponent(segment)
    .toLowerCase()
    .split(VS_SEPARATOR)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Build the path for an ordered list of competitor slugs.
 * ["spotify", "soundcloud"] → "/spotify-vs-soundcloud"
 */
export function buildComparePath(slugs: string[]): string {
  return `/${slugs.join(VS_SEPARATOR)}`;
}

/**
 * Normalize a requested slug list: drop the implicit "audius", dedupe while
 * preserving order, cap at MAX_COMPETITORS. Returns [] if nothing remains
 * (caller should send that to "/").
 */
export function normalizeCompareSlugs(slugs: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const slug of slugs) {
    if (slug === AUDIUS_SLUG || seen.has(slug)) continue;
    seen.add(slug);
    result.push(slug);
    if (result.length === MAX_COMPETITORS) break;
  }
  return result;
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((slug) => set.has(slug));
}

/**
 * If the slugs match a curated combo (in any order), return the curated
 * canonical order; otherwise return the slugs unchanged. Ad-hoc combos keep
 * the user's order — they're noindex, so permutations are harmless.
 */
export function canonicalizeCombo(slugs: string[]): string[] {
  if (slugs.length < 2) return slugs;
  const curated = CURATED_COMBOS.find((combo) => sameSet(combo, slugs));
  return curated ? [...curated] : slugs;
}

/**
 * Indexable pages: every 1v1 comparison, plus curated combos.
 */
export function isIndexableCombo(slugs: string[]): boolean {
  if (slugs.length === 1) return true;
  return CURATED_COMBOS.some((combo) => sameSet(combo, slugs));
}

/**
 * Human-readable name list: "Audius vs Bandcamp vs SoundCloud"
 */
export function compareTitle(competitorNames: string[], separator = ' vs '): string {
  return ['Audius', ...competitorNames].join(separator);
}

/**
 * Guard for admin-created platform slugs so they can't collide with the
 * comparison URL grammar. Returns an error message, or null when valid.
 */
export function validatePlatformSlug(
  slug: string,
  { isAudius = false }: { isAudius?: boolean } = {}
): string | null {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return 'Slug must be lowercase letters, numbers, and hyphens (no leading/trailing hyphen)';
  }
  if (slug.includes(VS_SEPARATOR)) {
    return `Slug cannot contain "${VS_SEPARATOR}" — it separates platforms in comparison URLs`;
  }
  if (slug === AUDIUS_SLUG && !isAudius) {
    return '"audius" is reserved for the Audius platform';
  }
  return null;
}
