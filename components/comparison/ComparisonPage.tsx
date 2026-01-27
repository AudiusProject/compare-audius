// components/comparison/ComparisonPage.tsx
import { PageHeader } from './PageHeader';
import { ComparisonTable } from './ComparisonTable';
import { ComparisonCards } from './ComparisonCards';
import type { ComparisonPageProps } from '@/types';

export function ComparisonPage({ 
  competitor, 
  competitors, 
  comparisons 
}: ComparisonPageProps) {
  return (
    <div className="bg-surface-alt min-h-screen">
      <div className="container-narrow">
        <PageHeader 
          competitor={competitor}
          competitors={competitors}
        />
        
        {/* Desktop view - table */}
        <div className="hidden md:block pb-16">
          <ComparisonTable 
            competitor={competitor}
            comparisons={comparisons}
          />
        </div>
        
        {/* Mobile view - cards */}
        <div className="md:hidden pb-8">
          <ComparisonCards 
            competitor={competitor}
            comparisons={comparisons}
          />
        </div>
      </div>
    </div>
  );
}
