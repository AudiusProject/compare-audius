// components/comparison/PageHeader.tsx
import { CompetitorSelector } from './CompetitorSelector';
import type { Platform } from '@/types';

interface PageHeaderProps {
  competitor: Platform;
  competitors: Platform[];
}

export function PageHeader({ competitor, competitors }: PageHeaderProps) {
  return (
    <div className="relative z-30 flex flex-col items-center py-8 sm:py-10 md:py-14 text-center">
      {/* Badge */}
      <span className="text-fluid-small font-mono tracking-[0.08em] text-audius-purple">
        Compare
      </span>
      
      {/* Title with selector - stacked on mobile, inline on desktop */}
      <h1 className="mt-3 text-fluid-display font-black tracking-tight leading-[0.9] text-text-primary text-balance">
        <span className="block md:inline">
          Audius vs.
        </span>
        <span className="block md:inline md:ml-3">
          <CompetitorSelector current={competitor} options={competitors} />
        </span>
      </h1>
      
      {/* Subtitle */}
      <p className="mt-4 text-text-secondary text-fluid-body max-w-xl">
        See how we stack up against the bigger fish.
      </p>
    </div>
  );
}
