// components/comparison/ComparisonTable.tsx
import { PlatformHeader } from './PlatformHeader';
import type { Platform, FeatureComparison, ComparisonStatus } from '@/types';
import { CheckIcon, XIcon, MinusIcon } from '@/components/ui/Icon';

interface ComparisonTableProps {
  audius: Platform;
  competitor: Platform;
  comparisons: FeatureComparison[];
}

export function ComparisonTable({ audius, competitor, comparisons }: ComparisonTableProps) {
  
  return (
    <div className="relative z-10 animate-slide-up">
      {/* Sticky platform header row */}
      <div className="sticky top-[var(--spacing-header-height)] z-20 bg-surface-90 backdrop-blur pb-px border-b border-border-light">
        {/* Background extension to cover any gaps */}
        <div className="absolute inset-x-0 -top-4 h-4 bg-surface-90" />
        
        <div className="grid grid-cols-[minmax(180px,1fr)_minmax(140px,1fr)_minmax(140px,1fr)] lg:grid-cols-[minmax(200px,320px)_minmax(200px,360px)_minmax(200px,360px)]">
          {/* Empty cell for feature column */}
          <div className="h-[100px] lg:h-[120px] bg-surface" />
          
          {/* Audius platform header */}
          <div className="h-[100px] lg:h-[120px] border border-border rounded-t-2xl bg-surface-raised flex items-center justify-center overflow-hidden ring-1 ring-audius-purple/20 shadow-[var(--shadow-panel)]">
            <PlatformHeader platform={audius} />
          </div>
          
          {/* Competitor platform header */}
          <div className="h-[100px] lg:h-[120px] bg-surface-alt flex items-center justify-center overflow-hidden">
            <PlatformHeader platform={competitor} />
          </div>
        </div>
      </div>
      
      {/* Feature rows container */}
      <div className="relative z-10">
        <div className="grid grid-cols-[minmax(180px,1fr)_minmax(140px,1fr)_minmax(140px,1fr)] lg:grid-cols-[minmax(200px,320px)_minmax(200px,360px)_minmax(200px,360px)]">
          {/* Feature column */}
          <div className="bg-surface">
            {comparisons.map((comparison) => (
              <div 
                key={`feature-${comparison.feature.id}`}
                className="h-[100px] p-4 lg:p-5 flex flex-col justify-center border-t border-border"
              >
                <h3 className="text-feature-name text-sm lg:text-base">{comparison.feature.name}</h3>
                <p className="text-feature-desc text-xs lg:text-sm mt-1 line-clamp-2 lg:line-clamp-none">
                  {comparison.feature.description}
                </p>
              </div>
            ))}
          </div>
          
          {/* Audius column - white background with borders */}
          <div className="bg-surface-raised border-l border-r border-b border-border rounded-b-2xl ring-1 ring-audius-purple/20 shadow-[var(--shadow-panel)]">
            {comparisons.map((comparison) => (
              <div 
                key={`audius-${comparison.feature.id}`}
                className="h-[100px] p-3 lg:p-5 flex items-center justify-center border-t border-border"
              >
                <StatusCell 
                  status={comparison.audius.status}
                  displayValue={comparison.audius.displayValue}
                  context={comparison.audius.context}
                />
              </div>
            ))}
          </div>
          
          {/* Competitor column */}
          <div className="bg-surface-alt">
            {comparisons.map((comparison) => (
              <div 
                key={`competitor-${comparison.feature.id}`}
                className="h-[100px] p-3 lg:p-5 flex items-center justify-center border-t border-border"
              >
                <StatusCell 
                  status={comparison.competitor.status}
                  displayValue={comparison.competitor.displayValue}
                  context={comparison.competitor.context}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline status cell component
function StatusCell({ 
  status, 
  displayValue, 
  context 
}: { 
  status: ComparisonStatus;
  displayValue?: string | null;
  context?: string | null;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      {status === 'custom' && displayValue && (
        <span className="text-base lg:text-lg font-semibold text-text-primary">
          {displayValue}
        </span>
      )}
      
      {status === 'yes' && (
        <div className="w-6 h-6 rounded-full bg-status-yes flex items-center justify-center">
          <CheckIcon className="text-on-status w-4 h-4" />
        </div>
      )}
      
      {status === 'no' && (
        <div className="w-6 h-6 rounded-full bg-status-no flex items-center justify-center">
          <XIcon className="text-on-status w-4 h-4" />
        </div>
      )}
      
      {status === 'partial' && (
        <>
          <div className="w-6 h-6 rounded-full bg-status-partial flex items-center justify-center">
            <MinusIcon className="text-on-status w-4 h-4" />
          </div>
          {context && (
            <span className="text-xs lg:text-status-context text-center max-w-[120px] lg:max-w-[200px]">
              {context}
            </span>
          )}
        </>
      )}
    </div>
  );
}
