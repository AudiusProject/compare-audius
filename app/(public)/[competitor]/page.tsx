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
import type { Metadata } from 'next';

// Static params for all competitors
export async function generateStaticParams() {
  const slugs = await getCompetitorSlugs();
  return slugs.map(slug => ({ competitor: slug }));
}

// Dynamic metadata
export async function generateMetadata(props: { 
  params: Promise<{ competitor: string }> 
}): Promise<Metadata> {
  const params = await props.params;
  const competitor = await getPlatform(params.competitor);
  if (!competitor) return {};
  
  return {
    title: `Audius vs ${competitor.name}`,
    description: `Compare Audius and ${competitor.name}. See streaming quality, features, and more.`,
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
