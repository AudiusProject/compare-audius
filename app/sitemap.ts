// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { getCompetitorSlugs } from '@/lib/data';

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

  // Dynamic competitor pages
  const competitorPages: MetadataRoute.Sitemap = competitorSlugs.map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...competitorPages];
}
