// components/comparison/ComparisonCards.tsx
import { FeatureCard } from './FeatureCard';
import type { Platform, ComparisonRow } from '@/types';

interface ComparisonCardsProps {
  /** Row order: [audius, ...competitors] */
  platforms: Platform[];
  rows: ComparisonRow[];
}

export function ComparisonCards({ platforms, rows }: ComparisonCardsProps) {
  return (
    <div className="space-y-4">
      {rows.map((row, index) => (
        <div
          key={row.feature.id}
          className="animate-slide-up"
          // Cap the stagger so late cards don't wait around off-screen
          style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
        >
          <FeatureCard platforms={platforms} row={row} />
        </div>
      ))}
    </div>
  );
}
