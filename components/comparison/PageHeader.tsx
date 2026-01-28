// components/comparison/PageHeader.tsx
import { CompetitorSelector } from './CompetitorSelector';
import type { Platform } from '@/types';

interface PageHeaderProps {
  competitor: Platform;
  competitors: Platform[];
}

export function PageHeader({ competitor, competitors }: PageHeaderProps) {
  return (
    <div className="flex flex-col items-center py-8 md:py-16 px-4">
      {/* Badge */}
      <span className="text-badge">
        Compare
      </span>
      
      {/* Title with selector - stacked on mobile, inline on desktop */}
      <h1 className="mt-3 text-center">
        <span className="block md:inline text-3xl md:text-5xl font-extrabold text-text-primary">
          Audius vs.
        </span>
        <span className="block md:inline md:ml-2 text-3xl md:text-5xl font-extrabold text-text-primary">
          <CompetitorSelector current={competitor} options={competitors} />
        </span>
      </h1>
      
      {/* Subtitle */}
      <p className="text-base md:text-xl text-text-primary mt-3 max-w-md text-center">
        See how we stack up against the bigger fish.
      </p>
    </div>
  );
}
