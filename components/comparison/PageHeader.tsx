// components/comparison/PageHeader.tsx
import { CompetitorSelector } from './CompetitorSelector';
import type { Platform } from '@/types';

interface PageHeaderProps {
  competitor: Platform;
  competitors: Platform[];
}

export function PageHeader({ competitor, competitors }: PageHeaderProps) {
  return (
    <div className="text-center py-8 md:py-16 px-4">
      {/* Badge */}
      <span className="text-badge">
        Compare
      </span>
      
      {/* Title with selector */}
      <h1 className="text-page-title mt-3">
        Audius vs.{' '}
        <CompetitorSelector current={competitor} options={competitors} />
      </h1>
      
      {/* Subtitle */}
      <p className="text-section-title text-text-primary mt-3 max-w-md mx-auto">
        See how we stack up against the bigger fish.
      </p>
    </div>
  );
}
