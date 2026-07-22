// components/comparison/FeatureCard.tsx
import Image from 'next/image';
import { StatusIndicator } from './StatusIndicator';
import type { Platform, ComparisonRow } from '@/types';

interface FeatureCardProps {
  /** Row order: [audius, ...competitors] */
  platforms: Platform[];
  row: ComparisonRow;
}

export function FeatureCard({ platforms, row }: FeatureCardProps) {
  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-surface-alt-85 backdrop-blur shadow-[var(--shadow-panel)]">
      {/* Feature header */}
      <div className="px-4 py-3.5 border-b border-border">
        <h3 className="text-[1.2rem] font-bold leading-[1.25] tracking-normal text-text-primary text-balance">
          {row.feature.name}
        </h3>
        <p className="mt-1 text-[0.8rem] leading-[1.45] text-text-muted">
          {row.feature.description}
        </p>
      </div>

      {/* One line per platform */}
      {platforms.map((platform, index) => (
        <div
          key={platform.id}
          className="px-4 py-3 min-h-[56px] flex items-center gap-4 border-b border-border last:border-b-0"
        >
          <div className="relative w-[72px] h-[28px] shrink-0 logo-white">
            <Image
              src={platform.logo}
              alt={platform.name}
              fill
              className="object-contain object-left logo-white"
              sizes="72px"
            />
          </div>
          <div className="flex-1" />
          <div className="w-[160px] sm:w-[200px] flex justify-center shrink-0">
            <StatusIndicator
              status={row.cells[index].status}
              displayValue={row.cells[index].displayValue}
              context={row.cells[index].context}
              compact
            />
          </div>
        </div>
      ))}
    </div>
  );
}
