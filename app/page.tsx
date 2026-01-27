// app/page.tsx
import { ComparisonPage } from '@/components/comparison/ComparisonPage';
import { getComparisonData, getPlatform, getCompetitors } from '@/lib/data';
import { DEFAULT_COMPETITOR } from '@/lib/constants';

export default function HomePage() {
  const competitor = getPlatform(DEFAULT_COMPETITOR)!;
  const competitors = getCompetitors();
  const comparisons = getComparisonData(DEFAULT_COMPETITOR);
  
  return (
    <ComparisonPage 
      competitor={competitor}
      competitors={competitors}
      comparisons={comparisons}
    />
  );
}
