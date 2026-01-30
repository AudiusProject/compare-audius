// app/(public)/page.tsx
import type { Metadata } from 'next';
import { ComparisonPage } from '@/components/comparison/ComparisonPage';
import { getComparisonData, getPlatform, getCompetitors } from '@/lib/data';
import { DEFAULT_COMPETITOR, SITE_URL, SITE_NAME } from '@/lib/constants';

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
  const competitor = await getPlatform(DEFAULT_COMPETITOR);
  const competitors = await getCompetitors();
  const comparisons = await getComparisonData(DEFAULT_COMPETITOR);
  
  if (!competitor) {
    throw new Error(`Default competitor not found: ${DEFAULT_COMPETITOR}`);
  }
  
  return (
    <ComparisonPage 
      competitor={competitor}
      competitors={competitors}
      comparisons={comparisons}
    />
  );
}
