// lib/data.ts

import { db } from '@/db';
import { platforms, features, comparisons } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import type { Platform, Feature, Comparison } from '@/db/schema';
import type { ComparisonData, ComparisonRow } from '@/types';

// Re-export types for components
export type { Platform, Feature, Comparison };
export type { ComparisonData, ComparisonRow };

/**
 * Get all published platforms
 */
export async function getPlatforms(): Promise<Platform[]> {
  return db.select().from(platforms).where(eq(platforms.isDraft, false));
}

/**
 * Get all platforms (including drafts) - for admin
 */
export async function getAllPlatforms(): Promise<Platform[]> {
  return db.select().from(platforms);
}

/**
 * Get a single platform by slug
 */
export async function getPlatform(slug: string): Promise<Platform | undefined> {
  const results = await db.select().from(platforms).where(eq(platforms.slug, slug));
  return results[0];
}

/**
 * Get a single platform by ID
 */
export async function getPlatformById(id: string): Promise<Platform | undefined> {
  const results = await db.select().from(platforms).where(eq(platforms.id, id));
  return results[0];
}

/**
 * Get Audius platform
 */
export async function getAudius(): Promise<Platform> {
  const results = await db.select().from(platforms).where(eq(platforms.isAudius, true));
  if (!results[0]) throw new Error('Audius platform not found');
  return results[0];
}

/**
 * Get published competitor platforms (non-Audius)
 */
export async function getCompetitors(): Promise<Platform[]> {
  return db.select().from(platforms).where(
    and(
      eq(platforms.isAudius, false),
      eq(platforms.isDraft, false)
    )
  );
}

/**
 * Get all published features sorted by sortOrder
 */
export async function getFeatures(): Promise<Feature[]> {
  return db.select().from(features)
    .where(eq(features.isDraft, false))
    .orderBy(asc(features.sortOrder));
}

/**
 * Get all features (including drafts) - for admin
 */
export async function getAllFeatures(): Promise<Feature[]> {
  return db.select().from(features).orderBy(asc(features.sortOrder));
}

/**
 * Get a single feature by slug
 */
export async function getFeature(slug: string): Promise<Feature | undefined> {
  const results = await db.select().from(features).where(eq(features.slug, slug));
  return results[0];
}

/**
 * Get a single feature by ID
 */
export async function getFeatureById(id: string): Promise<Feature | undefined> {
  const results = await db.select().from(features).where(eq(features.id, id));
  return results[0];
}

/**
 * Get all comparisons
 */
export async function getAllComparisons(): Promise<Comparison[]> {
  return db.select().from(comparisons);
}

/**
 * Get comparisons for a specific feature
 */
export async function getComparisonsByFeature(featureId: string): Promise<Comparison[]> {
  return db.select().from(comparisons).where(eq(comparisons.featureId, featureId));
}

/**
 * Get comparison for a specific platform and feature
 */
export async function getComparison(platformId: string, featureId: string): Promise<Comparison | undefined> {
  const results = await db.select().from(comparisons).where(
    and(
      eq(comparisons.platformId, platformId),
      eq(comparisons.featureId, featureId)
    )
  );
  return results[0];
}

/**
 * Get full comparison data for one or more competitors (public site).
 *
 * A feature row is included only when EVERY selected platform (Audius plus
 * all competitors) has a comparison whose status isn't 'skip' — the lowest
 * common denominator. A 'skip' row is the admin's explicit "leave this cell
 * blank" signal and is treated as if the row didn't exist.
 */
export async function getComparisonData(competitorSlugs: string[]): Promise<ComparisonData> {
  if (competitorSlugs.length === 0) {
    throw new Error('getComparisonData requires at least one competitor slug');
  }

  const [allPlatforms, featureList, allComparisons] = await Promise.all([
    getPlatforms(), // Already filtered to published
    getFeatures(), // Already filtered to published
    getAllComparisons(),
  ]);

  const audius = allPlatforms.find(p => p.isAudius);
  if (!audius) throw new Error('Audius platform not found');

  const competitors = competitorSlugs.map(slug => {
    const platform = allPlatforms.find(p => p.slug === slug && !p.isAudius);
    if (!platform) throw new Error(`Unknown or unpublished competitor: ${slug}`);
    return platform;
  });

  const platforms = [audius, ...competitors];

  const byPlatformFeature = new Map<string, Comparison>();
  for (const comparison of allComparisons) {
    byPlatformFeature.set(`${comparison.platformId}:${comparison.featureId}`, comparison);
  }

  const rows: ComparisonRow[] = [];
  for (const feature of featureList) {
    const cells: Comparison[] = [];
    for (const platform of platforms) {
      const cell = byPlatformFeature.get(`${platform.id}:${feature.id}`);
      if (!cell || cell.status === 'skip') break;
      cells.push(cell);
    }
    if (cells.length === platforms.length) {
      rows.push({ feature, cells });
    }
  }

  // Competitors worth offering in the "+" menu: adding one must keep at
  // least one row (it has a non-skip cell on some feature we already show).
  const selectedIds = new Set(platforms.map(p => p.id));
  const addableCompetitors = allPlatforms.filter(candidate => {
    if (candidate.isAudius || selectedIds.has(candidate.id)) return false;
    return rows.some(row => {
      const cell = byPlatformFeature.get(`${candidate.id}:${row.feature.id}`);
      return cell !== undefined && cell.status !== 'skip';
    });
  });

  return { audius, competitors, platforms, rows, addableCompetitors };
}

/**
 * Check if a slug is a valid published competitor
 */
export async function isValidCompetitor(slug: string): Promise<boolean> {
  const competitors = await getCompetitors();
  return competitors.some(c => c.slug === slug);
}

/**
 * Get all valid competitor slugs (for generateStaticParams)
 */
export async function getCompetitorSlugs(): Promise<string[]> {
  const competitors = await getCompetitors();
  return competitors.map(c => c.slug);
}
