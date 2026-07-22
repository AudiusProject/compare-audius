// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { getCompetitorSlugs } from '@/lib/data';
import { buildComparePath } from '@/lib/compare';
import { CURATED_COMBOS } from '@/lib/constants';

// Revalidate every hour to pick up new platforms
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://compare.audius.co';

  // Get all competitor slugs from the database
  const competitorSlugs = await getCompetitorSlugs();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];

  // Dynamic 1v1 competitor pages
  const competitorPages: MetadataRoute.Sitemap = competitorSlugs.map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Curated multi-platform combos (only when every member is published)
  const comboPages: MetadataRoute.Sitemap = CURATED_COMBOS
    .filter((combo) => combo.every((slug) => competitorSlugs.includes(slug)))
    .map((combo) => ({
      url: `${baseUrl}${buildComparePath(combo)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  return [...staticPages, ...competitorPages, ...comboPages];
}
