// components/comparison/ComparisonCards.tsx
import { FeatureCard } from './FeatureCard';
import type { Platform, FeatureComparison } from '@/types';

interface ComparisonCardsProps {
  competitor: Platform;
  comparisons: FeatureComparison[];
}

export function ComparisonCards({ competitor, comparisons }: ComparisonCardsProps) {
  return (
    <div className="space-y-4">
      {comparisons.map((comparison) => (
        <FeatureCard
          key={comparison.feature.id}
          comparison={comparison}
          competitor={competitor}
        />
      ))}
    </div>
  );
}
