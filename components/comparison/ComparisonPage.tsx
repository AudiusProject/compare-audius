// components/comparison/ComparisonPage.tsx
import { PageHeader } from './PageHeader';
import { ComparisonTable } from './ComparisonTable';
import { ComparisonCards } from './ComparisonCards';
import { ComparisonSchema } from '@/components/seo/StructuredData';
import type { ComparisonPageProps } from '@/types';

export async function ComparisonPage({ 
  competitor, 
  competitors, 
  comparisons 
}: ComparisonPageProps) {
  // Import here to avoid making this a client component
  const { getAudius } = await import('@/lib/data');
  const audius = await getAudius();
  
  return (
    <>
      <ComparisonSchema competitor={competitor} comparisons={comparisons} />
      <div className="relative min-h-screen pb-16 md:pb-24">
        <div className="container-narrow relative z-10">
          <PageHeader 
            competitor={competitor}
            competitors={competitors}
          />
          
          {/* Desktop view - table */}
          <div className="hidden md:block pb-16">
            <ComparisonTable 
              audius={audius}
              competitor={competitor}
              comparisons={comparisons}
            />
          </div>
          
          {/* Mobile view - cards */}
          <div className="md:hidden pb-8">
            <ComparisonCards 
              audius={audius}
              competitor={competitor}
              comparisons={comparisons}
            />
          </div>
        </div>
      </div>
    </>
  );
}
