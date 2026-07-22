// components/comparison/ComparisonPage.tsx
import { PageHeader } from './PageHeader';
import { ComparisonTable } from './ComparisonTable';
import { ComparisonCards } from './ComparisonCards';
import { ComparisonSchema } from '@/components/seo/StructuredData';
import type { Platform, ComparisonData } from '@/types';

/**
 * Shown when the selected platforms share no comparable features (the row
 * intersection is empty) — reachable now that ad-hoc combos exist.
 */
function EmptyComparison({ platforms }: { platforms: Platform[] }) {
  const names = platforms.map((p) => p.name);
  const list = names.length <= 2
    ? names.join(' and ')
    : `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;

  return (
    <div className="animate-slide-up border border-border rounded-2xl bg-surface-alt-85 backdrop-blur px-6 py-16 md:py-24 text-center mb-16">
      <p className="text-fluid-subheading font-bold text-text-primary text-balance">
        No overlapping features to compare
      </p>
      <p className="mt-3 text-fluid-body text-text-secondary max-w-md mx-auto text-balance">
        {list} don&rsquo;t share any comparable features yet. Try removing a
        platform from the comparison above.
      </p>
    </div>
  );
}

interface ComparisonPageProps {
  data: ComparisonData;
  /** All published competitors (for the builder menus) */
  allCompetitors: Platform[];
  /** Structured data only ships on indexable pages (1v1 + curated combos) */
  indexable: boolean;
}

export function ComparisonPage({ data, allCompetitors, indexable }: ComparisonPageProps) {
  return (
    <>
      {indexable && <ComparisonSchema competitors={data.competitors} rows={data.rows} />}
      <div className="relative min-h-screen pb-16 md:pb-24">
        <div className="container-narrow relative z-10">
          <PageHeader
            competitors={data.competitors}
            allCompetitors={allCompetitors}
            addableCompetitors={data.addableCompetitors}
          />

          {data.rows.length === 0 ? (
            <EmptyComparison platforms={data.platforms} />
          ) : (
            <>
              {/* Desktop view - table */}
              <div className="hidden md:block pb-16">
                <ComparisonTable platforms={data.platforms} rows={data.rows} />
              </div>

              {/* Mobile view - cards */}
              <div className="md:hidden pb-8">
                <ComparisonCards platforms={data.platforms} rows={data.rows} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
