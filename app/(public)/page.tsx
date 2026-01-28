// app/(public)/page.tsx
import { ComparisonPage } from '@/components/comparison/ComparisonPage';
import { getComparisonData, getPlatform, getCompetitors } from '@/lib/data';
import { DEFAULT_COMPETITOR } from '@/lib/constants';

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
