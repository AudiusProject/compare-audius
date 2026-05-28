// lib/data-io.ts
//
// Export/import format for admin data (platforms, features, comparisons).
// Uses slugs as natural keys so files are stable across environments and easy
// for an LLM to round-trip. Internal ids and timestamps are intentionally omitted.

import { db } from '@/db';
import { platforms, features, comparisons } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { Platform, Feature, Comparison } from '@/db/schema';

export const EXPORT_VERSION = 1;

const COMPARISON_STATUSES = ['yes', 'no', 'partial', 'custom', 'skip'] as const;
type ComparisonStatus = (typeof COMPARISON_STATUSES)[number];

export interface PlatformExport {
  slug: string;
  name: string;
  logo: string;
  isAudius: boolean;
  isDraft: boolean;
}

export interface FeatureExport {
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  isDraft: boolean;
}

export interface ComparisonExport {
  platformSlug: string;
  featureSlug: string;
  status: ComparisonStatus;
  displayValue: string | null;
  context: string | null;
}

export interface ExportFile {
  version: number;
  exportedAt: string;
  platforms: PlatformExport[];
  features: FeatureExport[];
  comparisons: ComparisonExport[];
}

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

function toPlatformExport(p: Platform): PlatformExport {
  return {
    slug: p.slug,
    name: p.name,
    logo: p.logo,
    isAudius: p.isAudius,
    isDraft: p.isDraft,
  };
}

function toFeatureExport(f: Feature): FeatureExport {
  return {
    slug: f.slug,
    name: f.name,
    description: f.description,
    sortOrder: f.sortOrder,
    isDraft: f.isDraft,
  };
}

function toComparisonExport(
  c: Comparison,
  platformSlug: string,
  featureSlug: string,
): ComparisonExport {
  return {
    platformSlug,
    featureSlug,
    status: c.status,
    displayValue: c.displayValue ?? null,
    context: c.context ?? null,
  };
}

export async function buildExport(): Promise<ExportFile> {
  const [allPlatforms, allFeatures, allComparisons] = await Promise.all([
    db.select().from(platforms),
    db.select().from(features),
    db.select().from(comparisons),
  ]);

  const platformSlugById = new Map(allPlatforms.map((p) => [p.id, p.slug]));
  const featureSlugById = new Map(allFeatures.map((f) => [f.id, f.slug]));

  const sortedPlatforms = [...allPlatforms].sort((a, b) => a.slug.localeCompare(b.slug));
  const sortedFeatures = [...allFeatures].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug),
  );
  const exportComparisons: ComparisonExport[] = allComparisons
    .map((c) => {
      const pSlug = platformSlugById.get(c.platformId);
      const fSlug = featureSlugById.get(c.featureId);
      if (!pSlug || !fSlug) return null; // orphaned row, skip
      return toComparisonExport(c, pSlug, fSlug);
    })
    .filter((c): c is ComparisonExport => c !== null)
    .sort(
      (a, b) =>
        a.platformSlug.localeCompare(b.platformSlug) ||
        a.featureSlug.localeCompare(b.featureSlug),
    );

  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    platforms: sortedPlatforms.map(toPlatformExport),
    features: sortedFeatures.map(toFeatureExport),
    comparisons: exportComparisons,
  };
}

// ---------------------------------------------------------------------------
// Parsing & validation
// ---------------------------------------------------------------------------

export interface ParseResult {
  data: ExportFile | null;
  errors: string[];
}

function isString(x: unknown): x is string {
  return typeof x === 'string';
}
function isBool(x: unknown): x is boolean {
  return typeof x === 'boolean';
}
function isNumber(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x);
}

export function parseExport(input: unknown): ParseResult {
  const errors: string[] = [];

  if (!input || typeof input !== 'object') {
    return { data: null, errors: ['File is not a JSON object'] };
  }
  const obj = input as Record<string, unknown>;

  if (obj.version !== EXPORT_VERSION) {
    errors.push(`Unsupported version: ${String(obj.version)} (expected ${EXPORT_VERSION})`);
  }

  const platforms: PlatformExport[] = [];
  const features: FeatureExport[] = [];
  const comparisons: ComparisonExport[] = [];

  if (!Array.isArray(obj.platforms)) {
    errors.push('Missing or invalid "platforms" array');
  } else {
    obj.platforms.forEach((raw, i) => {
      const p = raw as Record<string, unknown>;
      const ctx = `platforms[${i}]`;
      if (!isString(p.slug)) return errors.push(`${ctx}.slug must be a string`);
      if (!isString(p.name)) return errors.push(`${ctx}.name must be a string`);
      if (!isString(p.logo)) return errors.push(`${ctx}.logo must be a string`);
      if (!isBool(p.isAudius)) return errors.push(`${ctx}.isAudius must be a boolean`);
      if (!isBool(p.isDraft)) return errors.push(`${ctx}.isDraft must be a boolean`);
      platforms.push({
        slug: p.slug,
        name: p.name,
        logo: p.logo,
        isAudius: p.isAudius,
        isDraft: p.isDraft,
      });
    });
  }

  if (!Array.isArray(obj.features)) {
    errors.push('Missing or invalid "features" array');
  } else {
    obj.features.forEach((raw, i) => {
      const f = raw as Record<string, unknown>;
      const ctx = `features[${i}]`;
      if (!isString(f.slug)) return errors.push(`${ctx}.slug must be a string`);
      if (!isString(f.name)) return errors.push(`${ctx}.name must be a string`);
      if (!isString(f.description)) return errors.push(`${ctx}.description must be a string`);
      if (!isNumber(f.sortOrder)) return errors.push(`${ctx}.sortOrder must be a number`);
      if (!isBool(f.isDraft)) return errors.push(`${ctx}.isDraft must be a boolean`);
      features.push({
        slug: f.slug,
        name: f.name,
        description: f.description,
        sortOrder: f.sortOrder,
        isDraft: f.isDraft,
      });
    });
  }

  if (!Array.isArray(obj.comparisons)) {
    errors.push('Missing or invalid "comparisons" array');
  } else {
    obj.comparisons.forEach((raw, i) => {
      const c = raw as Record<string, unknown>;
      const ctx = `comparisons[${i}]`;
      if (!isString(c.platformSlug)) return errors.push(`${ctx}.platformSlug must be a string`);
      if (!isString(c.featureSlug)) return errors.push(`${ctx}.featureSlug must be a string`);
      if (!isString(c.status) || !COMPARISON_STATUSES.includes(c.status as ComparisonStatus)) {
        return errors.push(
          `${ctx}.status must be one of ${COMPARISON_STATUSES.join(', ')}`,
        );
      }
      const displayValue =
        c.displayValue === undefined || c.displayValue === null
          ? null
          : isString(c.displayValue)
            ? c.displayValue
            : (errors.push(`${ctx}.displayValue must be a string or null`), null);
      const context =
        c.context === undefined || c.context === null
          ? null
          : isString(c.context)
            ? c.context
            : (errors.push(`${ctx}.context must be a string or null`), null);
      comparisons.push({
        platformSlug: c.platformSlug,
        featureSlug: c.featureSlug,
        status: c.status as ComparisonStatus,
        displayValue,
        context,
      });
    });
  }

  // Cross-cutting validation
  const platformSlugs = new Set<string>();
  for (const p of platforms) {
    if (platformSlugs.has(p.slug)) errors.push(`Duplicate platform slug: ${p.slug}`);
    platformSlugs.add(p.slug);
  }
  const featureSlugs = new Set<string>();
  for (const f of features) {
    if (featureSlugs.has(f.slug)) errors.push(`Duplicate feature slug: ${f.slug}`);
    featureSlugs.add(f.slug);
  }
  const comparisonPairs = new Set<string>();
  for (const c of comparisons) {
    const key = `${c.platformSlug}::${c.featureSlug}`;
    if (comparisonPairs.has(key)) {
      errors.push(`Duplicate comparison: ${c.platformSlug} / ${c.featureSlug}`);
    }
    comparisonPairs.add(key);
  }
  const audiusCount = platforms.filter((p) => p.isAudius).length;
  if (audiusCount > 1) errors.push(`Only one platform may have isAudius = true (found ${audiusCount})`);

  if (errors.length > 0) return { data: null, errors };

  return {
    data: {
      version: EXPORT_VERSION,
      exportedAt: isString(obj.exportedAt) ? obj.exportedAt : new Date().toISOString(),
      platforms,
      features,
      comparisons,
    },
    errors: [],
  };
}

// ---------------------------------------------------------------------------
// Diff
// ---------------------------------------------------------------------------

export type FieldChange = { field: string; from: unknown; to: unknown };

export interface PlatformDiff {
  skipped: PlatformExport[];
  updated: Array<{ slug: string; changes: FieldChange[]; next: PlatformExport }>;
  created: PlatformExport[];
  missing: Array<{ slug: string; name: string }>;
}
export interface FeatureDiff {
  skipped: FeatureExport[];
  updated: Array<{ slug: string; changes: FieldChange[]; next: FeatureExport }>;
  created: FeatureExport[];
  missing: Array<{ slug: string; name: string }>;
}
export interface ComparisonDiff {
  skipped: ComparisonExport[];
  updated: Array<{
    platformSlug: string;
    featureSlug: string;
    changes: FieldChange[];
    next: ComparisonExport;
  }>;
  created: ComparisonExport[];
  missing: Array<{ platformSlug: string; featureSlug: string }>;
  invalid: Array<{ platformSlug: string; featureSlug: string; reason: string }>;
}

export interface ImportDiff {
  platforms: PlatformDiff;
  features: FeatureDiff;
  comparisons: ComparisonDiff;
}

function diffFields<T>(current: T, next: T, fields: (keyof T)[]): FieldChange[] {
  const changes: FieldChange[] = [];
  for (const f of fields) {
    if (current[f] !== next[f]) {
      changes.push({ field: String(f), from: current[f], to: next[f] });
    }
  }
  return changes;
}

export async function computeDiff(file: ExportFile): Promise<ImportDiff> {
  const [currentPlatforms, currentFeatures, currentComparisons] = await Promise.all([
    db.select().from(platforms),
    db.select().from(features),
    db.select().from(comparisons),
  ]);

  // ----- platforms
  const currentPlatformBySlug = new Map(currentPlatforms.map((p) => [p.slug, p]));
  const importedPlatformSlugs = new Set(file.platforms.map((p) => p.slug));

  const platformDiff: PlatformDiff = {
    skipped: [],
    updated: [],
    created: [],
    missing: [],
  };
  for (const incoming of file.platforms) {
    const existing = currentPlatformBySlug.get(incoming.slug);
    if (!existing) {
      platformDiff.created.push(incoming);
      continue;
    }
    const changes = diffFields(toPlatformExport(existing), incoming, [
      'name',
      'logo',
      'isAudius',
      'isDraft',
    ]);
    if (changes.length === 0) platformDiff.skipped.push(incoming);
    else platformDiff.updated.push({ slug: incoming.slug, changes, next: incoming });
  }
  for (const p of currentPlatforms) {
    if (!importedPlatformSlugs.has(p.slug)) {
      platformDiff.missing.push({ slug: p.slug, name: p.name });
    }
  }

  // ----- features
  const currentFeatureBySlug = new Map(currentFeatures.map((f) => [f.slug, f]));
  const importedFeatureSlugs = new Set(file.features.map((f) => f.slug));

  const featureDiff: FeatureDiff = {
    skipped: [],
    updated: [],
    created: [],
    missing: [],
  };
  for (const incoming of file.features) {
    const existing = currentFeatureBySlug.get(incoming.slug);
    if (!existing) {
      featureDiff.created.push(incoming);
      continue;
    }
    const changes = diffFields(toFeatureExport(existing), incoming, [
      'name',
      'description',
      'sortOrder',
      'isDraft',
    ]);
    if (changes.length === 0) featureDiff.skipped.push(incoming);
    else featureDiff.updated.push({ slug: incoming.slug, changes, next: incoming });
  }
  for (const f of currentFeatures) {
    if (!importedFeatureSlugs.has(f.slug)) {
      featureDiff.missing.push({ slug: f.slug, name: f.name });
    }
  }

  // ----- comparisons
  // Comparisons can reference platforms/features that exist in the DB OR that
  // are about to be created in this import. Anything else is invalid.
  const knownPlatformSlugs = new Set([
    ...currentPlatforms.map((p) => p.slug),
    ...file.platforms.map((p) => p.slug),
  ]);
  const knownFeatureSlugs = new Set([
    ...currentFeatures.map((f) => f.slug),
    ...file.features.map((f) => f.slug),
  ]);

  const currentComparisonByKey = new Map<string, Comparison & { _pSlug: string; _fSlug: string }>();
  const platformSlugById = new Map(currentPlatforms.map((p) => [p.id, p.slug]));
  const featureSlugById = new Map(currentFeatures.map((f) => [f.id, f.slug]));
  for (const c of currentComparisons) {
    const pSlug = platformSlugById.get(c.platformId);
    const fSlug = featureSlugById.get(c.featureId);
    if (!pSlug || !fSlug) continue;
    currentComparisonByKey.set(`${pSlug}::${fSlug}`, { ...c, _pSlug: pSlug, _fSlug: fSlug });
  }
  const importedComparisonKeys = new Set(
    file.comparisons.map((c) => `${c.platformSlug}::${c.featureSlug}`),
  );

  const comparisonDiff: ComparisonDiff = {
    skipped: [],
    updated: [],
    created: [],
    missing: [],
    invalid: [],
  };
  for (const incoming of file.comparisons) {
    if (!knownPlatformSlugs.has(incoming.platformSlug)) {
      comparisonDiff.invalid.push({
        platformSlug: incoming.platformSlug,
        featureSlug: incoming.featureSlug,
        reason: `Unknown platform slug "${incoming.platformSlug}"`,
      });
      continue;
    }
    if (!knownFeatureSlugs.has(incoming.featureSlug)) {
      comparisonDiff.invalid.push({
        platformSlug: incoming.platformSlug,
        featureSlug: incoming.featureSlug,
        reason: `Unknown feature slug "${incoming.featureSlug}"`,
      });
      continue;
    }
    const existing = currentComparisonByKey.get(
      `${incoming.platformSlug}::${incoming.featureSlug}`,
    );
    if (!existing) {
      comparisonDiff.created.push(incoming);
      continue;
    }
    const currentForDiff: ComparisonExport = {
      platformSlug: existing._pSlug,
      featureSlug: existing._fSlug,
      status: existing.status,
      displayValue: existing.displayValue ?? null,
      context: existing.context ?? null,
    };
    const changes = diffFields(currentForDiff, incoming, ['status', 'displayValue', 'context']);
    if (changes.length === 0) comparisonDiff.skipped.push(incoming);
    else
      comparisonDiff.updated.push({
        platformSlug: incoming.platformSlug,
        featureSlug: incoming.featureSlug,
        changes,
        next: incoming,
      });
  }
  for (const [key, c] of currentComparisonByKey) {
    if (!importedComparisonKeys.has(key)) {
      comparisonDiff.missing.push({ platformSlug: c._pSlug, featureSlug: c._fSlug });
    }
  }

  return { platforms: platformDiff, features: featureDiff, comparisons: comparisonDiff };
}

// ---------------------------------------------------------------------------
// Apply
// ---------------------------------------------------------------------------

export interface ApplyPayload {
  platforms: PlatformExport[]; // rows to create or update (matched by slug)
  features: FeatureExport[];
  comparisons: ComparisonExport[];
}

export interface ApplyResult {
  platforms: { created: number; updated: number };
  features: { created: number; updated: number };
  comparisons: { created: number; updated: number; skipped: number };
  errors: string[];
}

export async function applyImport(payload: ApplyPayload): Promise<ApplyResult> {
  const result: ApplyResult = {
    platforms: { created: 0, updated: 0 },
    features: { created: 0, updated: 0 },
    comparisons: { created: 0, updated: 0, skipped: 0 },
    errors: [],
  };

  const now = new Date();

  // -------- platforms (do these first so comparisons can resolve slugs) --------
  for (const p of payload.platforms) {
    const existing = await db.select().from(platforms).where(eq(platforms.slug, p.slug));
    if (existing[0]) {
      await db
        .update(platforms)
        .set({
          name: p.name,
          logo: p.logo,
          isAudius: p.isAudius,
          isDraft: p.isDraft,
          updatedAt: now,
        })
        .where(eq(platforms.id, existing[0].id));
      result.platforms.updated++;
    } else {
      await db.insert(platforms).values({
        id: nanoid(),
        slug: p.slug,
        name: p.name,
        logo: p.logo,
        isAudius: p.isAudius,
        isDraft: p.isDraft,
        createdAt: now,
        updatedAt: now,
      });
      result.platforms.created++;
    }
  }

  // -------- features --------
  for (const f of payload.features) {
    const existing = await db.select().from(features).where(eq(features.slug, f.slug));
    if (existing[0]) {
      await db
        .update(features)
        .set({
          name: f.name,
          description: f.description,
          sortOrder: f.sortOrder,
          isDraft: f.isDraft,
          updatedAt: now,
        })
        .where(eq(features.id, existing[0].id));
      result.features.updated++;
    } else {
      await db.insert(features).values({
        id: nanoid(),
        slug: f.slug,
        name: f.name,
        description: f.description,
        sortOrder: f.sortOrder,
        isDraft: f.isDraft,
        createdAt: now,
        updatedAt: now,
      });
      result.features.created++;
    }
  }

  // -------- comparisons --------
  // Re-fetch platform/feature ids after possible inserts above.
  const allPlatforms = await db.select().from(platforms);
  const allFeatures = await db.select().from(features);
  const platformIdBySlug = new Map(allPlatforms.map((p) => [p.slug, p.id]));
  const featureIdBySlug = new Map(allFeatures.map((f) => [f.slug, f.id]));

  for (const c of payload.comparisons) {
    const platformId = platformIdBySlug.get(c.platformSlug);
    const featureId = featureIdBySlug.get(c.featureSlug);
    if (!platformId || !featureId) {
      result.comparisons.skipped++;
      result.errors.push(
        `Skipped comparison ${c.platformSlug}/${c.featureSlug}: unresolved slug`,
      );
      continue;
    }
    const existing = await db
      .select()
      .from(comparisons)
      .where(and(eq(comparisons.platformId, platformId), eq(comparisons.featureId, featureId)));
    if (existing[0]) {
      await db
        .update(comparisons)
        .set({
          status: c.status,
          displayValue: c.displayValue,
          context: c.context,
          updatedAt: now,
        })
        .where(eq(comparisons.id, existing[0].id));
      result.comparisons.updated++;
    } else {
      await db.insert(comparisons).values({
        id: nanoid(),
        platformId,
        featureId,
        status: c.status,
        displayValue: c.displayValue,
        context: c.context,
        createdAt: now,
        updatedAt: now,
      });
      result.comparisons.created++;
    }
  }

  return result;
}
