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
      {comparisons.map((comparison, index) => (
        <div
          key={comparison.feature.id}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <FeatureCard
            audius={audius}
            comparison={comparison}
            competitor={competitor}
          />
        </div>
      ))}
    </div>
  );
}
