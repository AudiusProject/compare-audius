// app/(public)/[competitor]/page.tsx
import { notFound } from 'next/navigation';
import { ComparisonPage } from '@/components/comparison/ComparisonPage';
import { 
  getComparisonData, 
  getPlatform, 
  getCompetitors,
  getCompetitorSlugs,
  isValidCompetitor 
} from '@/lib/data';
import { SITE_URL, SITE_NAME } from '@/lib/constants';
import type { Metadata } from 'next';

// Static params for all competitors
export async function generateStaticParams() {
  const slugs = await getCompetitorSlugs();
  return slugs.map(slug => ({ competitor: slug }));
}

// Dynamic metadata with comprehensive SEO
export async function generateMetadata(props: { 
  params: Promise<{ competitor: string }> 
}): Promise<Metadata> {
  const params = await props.params;
  const competitor = await getPlatform(params.competitor);
  if (!competitor) return {};

  const title = `Audius vs ${competitor.name} | Feature Comparison`;
  const description = `Compare Audius and ${competitor.name} side by side. See how streaming quality, artist tools, and features stack up. Discover which platform is right for you.`;
  const pageUrl = `${SITE_URL}/${params.competitor}`;
  
  return {
    title,
    description,
    keywords: [
      `Audius vs ${competitor.name}`,
      `${competitor.name} alternative`,
      `${competitor.name} comparison`,
      'music streaming comparison',
      'artist platform comparison',
      'streaming quality comparison',
      'decentralized music',
    ],
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Audius vs ${competitor.name}`,
      description: `Compare Audius and ${competitor.name}. See streaming quality, features, and more.`,
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export default async function CompetitorPage(props: { 
  params: Promise<{ competitor: string }> 
}) {
  const params = await props.params;
  
  const isValid = await isValidCompetitor(params.competitor);
  if (!isValid) {
    notFound();
  }
  
  const competitor = await getPlatform(params.competitor);
  if (!competitor) {
    notFound();
  }
  
  const competitors = await getCompetitors();
  const comparisons = await getComparisonData(params.competitor);
  
  return (
    <ComparisonPage 
      competitor={competitor}
      competitors={competitors}
      comparisons={comparisons}
    />
  );
}
