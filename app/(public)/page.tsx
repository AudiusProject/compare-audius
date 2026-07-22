// app/(public)/page.tsx
import type { Metadata } from 'next';
import { ComparisonPage } from '@/components/comparison/ComparisonPage';
import { getComparisonData, getCompetitors } from '@/lib/data';
import { DEFAULT_COMPETITOR, SITE_URL, SITE_NAME } from '@/lib/constants';

// NOTE: og:image / twitter:image come from the opengraph-image.tsx /
// twitter-image.tsx file conventions in this segment — don't set `images`
// manually (a hand-built URL would miss Next's hash suffix and 404).
export const metadata: Metadata = {
  title: 'Audius vs The Industry | Compare Music Streaming Platforms',
  description: 'Compare Audius to major music streaming platforms. See how Audius stacks up against Spotify, SoundCloud, and more across streaming quality, features, and artist tools.',
  keywords: [
    'Audius comparison',
    'music streaming comparison',
    'Audius vs SoundCloud',
    'decentralized music platform',
    'artist-friendly streaming',
    'music platform features',
  ],
  openGraph: {
    title: 'Audius vs The Industry | Compare Music Streaming Platforms',
    description: 'Compare Audius to major music streaming platforms. See how features, streaming quality, and artist tools stack up.',
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Audius vs The Industry | Compare Music Streaming',
    description: 'Compare Audius to major music streaming platforms. See how features stack up.',
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default async function HomePage() {
  const [data, allCompetitors] = await Promise.all([
    getComparisonData([DEFAULT_COMPETITOR]),
    getCompetitors(),
  ]);

  return (
    <ComparisonPage
      data={data}
      allCompetitors={allCompetitors}
      indexable
    />
  );
}
