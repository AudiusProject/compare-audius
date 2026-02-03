// components/comparison/FeatureCard.tsx
import Image from 'next/image';
import { StatusIndicator } from './StatusIndicator';
import type { Platform, FeatureComparison } from '@/types';

interface FeatureCardProps {
  audius: Platform;
  comparison: FeatureComparison;
  competitor: Platform;
}

export function FeatureCard({ audius, comparison, competitor }: FeatureCardProps) {
  const { feature, audius: audiusStatus, competitor: competitorStatus } = comparison;
  
  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-surface-alt-85 backdrop-blur shadow-[var(--shadow-panel)]">
      {/* Feature header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-feature-name">{feature.name}</h3>
        <p className="text-feature-desc mt-1">
          {feature.description}
        </p>
      </div>
      
      {/* Audius section */}
      <div className="p-4 border-b border-border flex items-center gap-4">
        <div className="relative w-[80px] h-[32px] shrink-0 logo-white">
          <Image
            src={audius.logo}
            alt={audius.name}
            fill
            className="object-contain object-left logo-white"
            sizes="80px"
          />
        </div>
        <div className="flex-1" />
        <div className="w-[140px] flex justify-center shrink-0">
          <StatusIndicator
            status={audiusStatus.status}
            displayValue={audiusStatus.displayValue}
            context={audiusStatus.context}
            compact
          />
        </div>
      </div>
      
      {/* Competitor section */}
      <div className="p-4 flex items-center gap-4">
        <div className="relative w-[80px] h-[32px] shrink-0 logo-white">
          <Image
            src={competitor.logo}
            alt={competitor.name}
            fill
            className="object-contain object-left logo-white"
            sizes="80px"
          />
        </div>
        <div className="flex-1" />
        <div className="w-[140px] flex justify-center shrink-0">
          <StatusIndicator
            status={competitorStatus.status}
            displayValue={competitorStatus.displayValue}
            context={competitorStatus.context}
            compact
          />
        </div>
      </div>
    </div>
  );
}
