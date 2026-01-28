// lib/data.ts

import { db } from '@/db';
import { platforms, features, comparisons } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import type { Platform, Feature, Comparison } from '@/db/schema';

// Re-export types for components
export type { Platform, Feature, Comparison };

export interface FeatureComparison {
  feature: Feature;
  audius: Comparison;
  competitor: Comparison;
}

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
 * Get full comparison data for a competitor (public site)
 * Only includes published features and platforms
 */
export async function getComparisonData(competitorSlug: string): Promise<FeatureComparison[]> {
  const audius = await getAudius();
  const competitor = await getPlatform(competitorSlug);
  
  if (!competitor) {
    throw new Error(`Unknown competitor: ${competitorSlug}`);
  }
  
  if (competitor.isDraft) {
    throw new Error(`Competitor is in draft mode: ${competitorSlug}`);
  }
  
  const featureList = await getFeatures(); // Already filtered to published
  const allComparisons = await getAllComparisons();
  
  return featureList.map(feature => {
    const audiusComparison = allComparisons.find(
      c => c.platformId === audius.id && c.featureId === feature.id
    );
    const competitorComparison = allComparisons.find(
      c => c.platformId === competitor.id && c.featureId === feature.id
    );
    
    if (!audiusComparison) {
      throw new Error(`Missing Audius comparison for feature: ${feature.id}`);
    }
    if (!competitorComparison) {
      throw new Error(`Missing ${competitor.name} comparison for feature: ${feature.id}`);
    }
    
    return {
      feature,
      audius: audiusComparison,
      competitor: competitorComparison,
    };
  });
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
