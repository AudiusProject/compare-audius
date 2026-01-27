// app/[competitor]/page.tsx
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
  return getCompetitorSlugs().map(slug => ({ competitor: slug }));
}

// Dynamic metadata
export async function generateMetadata(props: { 
  params: Promise<{ competitor: string }> 
}): Promise<Metadata> {
  const params = await props.params;
  const competitor = getPlatform(params.competitor);
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
  
  if (!isValidCompetitor(params.competitor)) {
    notFound();
  }
  
  const competitor = getPlatform(params.competitor)!;
  const competitors = getCompetitors();
  const comparisons = getComparisonData(params.competitor);
  
  return (
    <ComparisonPage 
      competitor={competitor}
      competitors={competitors}
      comparisons={comparisons}
    />
  );
}
