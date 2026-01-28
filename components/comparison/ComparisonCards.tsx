// components/comparison/ComparisonCards.tsx
import { FeatureCard } from './FeatureCard';
import type { Platform, FeatureComparison } from '@/types';

interface ComparisonCardsProps {
  audius: Platform;
  competitor: Platform;
  comparisons: FeatureComparison[];
}

export function ComparisonCards({ audius, competitor, comparisons }: ComparisonCardsProps) {
  return (
    <div className="space-y-4">
      {comparisons.map((comparison) => (
        <FeatureCard
          key={comparison.feature.id}
          audius={audius}
          comparison={comparison}
          competitor={competitor}
        />
      ))}
    </div>
  );
}
