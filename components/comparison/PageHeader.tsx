// components/comparison/PageHeader.tsx
import { ComparisonBuilder } from './ComparisonBuilder';
import type { Platform } from '@/types';

interface PageHeaderProps {
  /** Currently selected competitors, in URL order */
  competitors: Platform[];
  /** All published competitors (for the swap menus) */
  allCompetitors: Platform[];
  /** Competitors that would keep ≥1 row if added (drives the "+" menu) */
  addableCompetitors: Platform[];
}

export function PageHeader({ competitors, allCompetitors, addableCompetitors }: PageHeaderProps) {
  return (
    <div className="relative z-30 flex flex-col items-center py-8 sm:py-10 md:py-14 text-center">
      {/* Badge */}
      <span className="text-fluid-small font-mono tracking-[0.08em] text-audius-purple">
        Compare
      </span>

      {/* Title: Audius vs. [token] vs. [token] [+] — stacked on mobile, inline on desktop */}
      <h1 className="mt-3 text-fluid-display font-black tracking-tight leading-[0.95] text-text-primary text-balance">
        <span className="block md:inline">Audius</span>
        <ComparisonBuilder
          competitors={competitors}
          allCompetitors={allCompetitors}
          addableCompetitors={addableCompetitors}
        />
      </h1>

      {/* Subtitle */}
      <p className="mt-4 text-text-secondary text-fluid-body max-w-xl">
        See how we stack up against our competitors.
      </p>
    </div>
  );
}
