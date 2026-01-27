// lib/data.ts

import platformsData from '@/data/platforms.json';
import featuresData from '@/data/features.json';
import comparisonsData from '@/data/comparisons.json';
import type { Platform, Feature, Comparison, FeatureComparison } from '@/types';

// Type assertions for imported JSON
const platforms = platformsData as Platform[];
const features = featuresData as Feature[];
const comparisons = comparisonsData as Comparison[];

/**
 * Get all platforms
 */
export function getPlatforms(): Platform[] {
  return platforms;
}

/**
 * Get a single platform by slug
 */
export function getPlatform(slug: string): Platform | undefined {
  return platforms.find(p => p.slug === slug);
}

/**
 * Get Audius platform
 */
export function getAudius(): Platform {
  const audius = platforms.find(p => p.isAudius);
  if (!audius) throw new Error('Audius platform not found in data');
  return audius;
}

/**
 * Get all competitor platforms (non-Audius)
 */
export function getCompetitors(): Platform[] {
  return platforms.filter(p => !p.isAudius);
}

/**
 * Get all features sorted by sortOrder
 */
export function getFeatures(): Feature[] {
  return [...features].sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get a single feature by slug
 */
export function getFeature(slug: string): Feature | undefined {
  return features.find(f => f.slug === slug);
}

/**
 * Get comparison for a specific platform and feature
 */
export function getComparison(platformId: string, featureId: string): Comparison | undefined {
  return comparisons.find(
    c => c.platformId === platformId && c.featureId === featureId
  );
}

/**
 * Get full comparison data for a competitor
 * Returns array of FeatureComparison objects ready for rendering
 */
export function getComparisonData(competitorSlug: string): FeatureComparison[] {
  const audius = getAudius();
  const competitor = getPlatform(competitorSlug);
  
  if (!competitor) {
    throw new Error(`Unknown competitor: ${competitorSlug}`);
  }
  
  if (competitor.isAudius) {
    throw new Error('Cannot compare Audius to itself');
  }
  
  const featureList = getFeatures();
  
  return featureList.map(feature => {
    const audiusComparison = getComparison(audius.id, feature.id);
    const competitorComparison = getComparison(competitor.id, feature.id);
    
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
 * Check if a slug is a valid competitor
 */
export function isValidCompetitor(slug: string): boolean {
  return getCompetitors().some(c => c.slug === slug);
}

/**
 * Get all valid competitor slugs (for generateStaticParams)
 */
export function getCompetitorSlugs(): string[] {
  return getCompetitors().map(c => c.slug);
}
