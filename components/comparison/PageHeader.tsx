// components/comparison/PageHeader.tsx
import { CompetitorSelector } from './CompetitorSelector';
import type { Platform } from '@/types';

interface PageHeaderProps {
  competitor: Platform;
  competitors: Platform[];
}

export function PageHeader({ competitor, competitors }: PageHeaderProps) {
  return (
    <div className="relative z-30 flex flex-col items-center py-8 sm:py-10 md:py-14 text-center animate-slide-up">
      {/* Badge */}
      <span className="text-fluid-small font-mono uppercase tracking-widest text-audius-purple">
        Compare
      </span>
      
      {/* Title with selector - stacked on mobile, inline on desktop */}
      <h1 className="mt-3 text-[clamp(3.25rem,1.6rem+8.5vw,7rem)] font-titular-heavy uppercase leading-[0.85] text-text-primary md:text-fluid-display">
        <span className="block md:inline">
          Audius vs.
        </span>
        <span className="block md:inline md:ml-3">
          <CompetitorSelector current={competitor} options={competitors} />
        </span>
      </h1>
      
      {/* Subtitle */}
      <p className="mt-4 text-text-secondary font-mono uppercase tracking-widest text-fluid-small max-w-xl">
        See how we stack up against the bigger fish.
      </p>
    </div>
  );
}
