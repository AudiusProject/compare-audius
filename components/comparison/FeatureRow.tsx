// components/comparison/FeatureRow.tsx
import { cn } from '@/lib/utils';
import { StatusIndicator } from './StatusIndicator';
import type { FeatureComparison } from '@/types';

interface FeatureRowProps {
  comparison: FeatureComparison;
  isAlternate?: boolean;
}

export function FeatureRow({ comparison, isAlternate }: FeatureRowProps) {
  const { feature, audius, competitor } = comparison;
  
  return (
    <div 
      className={cn(
        'grid grid-cols-[minmax(200px,320px)_minmax(200px,360px)_minmax(200px,360px)] border-t border-border',
        isAlternate ? 'bg-surface-alt' : 'bg-surface'
      )}
    >
      {/* Feature info */}
      <div className="p-5 flex flex-col gap-1">
        <h3 className="text-feature-name">{feature.name}</h3>
        <p className="text-feature-desc">
          {feature.description}
        </p>
      </div>
      
      {/* Audius status */}
      <div className="p-5 flex items-center justify-center border-l border-r border-border bg-surface-raised">
        <StatusIndicator
          status={audius.status}
          displayValue={audius.displayValue}
          context={audius.context}
        />
      </div>
      
      {/* Competitor status */}
      <div className="p-5 flex items-center justify-center">
        <StatusIndicator
          status={competitor.status}
          displayValue={competitor.displayValue}
          context={competitor.context}
        />
      </div>
    </div>
  );
}
