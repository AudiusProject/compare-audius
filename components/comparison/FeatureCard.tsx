// components/comparison/FeatureCard.tsx
import Image from 'next/image';
import { StatusIndicator } from './StatusIndicator';
import { getAudius } from '@/lib/data';
import type { Platform, FeatureComparison } from '@/types';

interface FeatureCardProps {
  comparison: FeatureComparison;
  competitor: Platform;
}

export function FeatureCard({ comparison, competitor }: FeatureCardProps) {
  const audius = getAudius();
  const { feature, audius: audiusStatus, competitor: competitorStatus } = comparison;
  
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white">
      {/* Feature header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-feature-name">{feature.name}</h3>
        <p className="text-feature-desc mt-1">
          {feature.description}
        </p>
      </div>
      
      {/* Audius section */}
      <div className="p-4 border-b border-border flex items-center justify-between gap-4">
        <div className="relative w-[80px] h-[32px] shrink-0">
          <Image
            src={audius.logo}
            alt={audius.name}
            fill
            className="object-contain object-left"
            sizes="80px"
          />
        </div>
        <StatusIndicator
          status={audiusStatus.status}
          displayValue={audiusStatus.displayValue}
          context={audiusStatus.context}
        />
      </div>
      
      {/* Competitor section */}
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="relative w-[80px] h-[32px] shrink-0">
          <Image
            src={competitor.logo}
            alt={competitor.name}
            fill
            className="object-contain object-left"
            sizes="80px"
          />
        </div>
        <StatusIndicator
          status={competitorStatus.status}
          displayValue={competitorStatus.displayValue}
          context={competitorStatus.context}
        />
      </div>
    </div>
  );
}
