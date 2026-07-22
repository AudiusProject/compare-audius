// components/comparison/ComparisonTable.tsx
import type { CSSProperties } from 'react';
import { PlatformHeader } from './PlatformHeader';
import { StatusIndicator } from './StatusIndicator';
import { cn } from '@/lib/utils';
import type { Platform, ComparisonRow } from '@/types';

interface ComparisonTableProps {
  /** Column order: [audius, ...competitors] */
  platforms: Platform[];
  rows: ComparisonRow[];
}

/**
 * Styling for a platform value column. Column 0 (Audius) is the raised hero
 * column — distinguished by background only, so every grid line (row and
 * column) uses the same border color.
 */
function valueColumnClasses(index: number, count: number): string {
  return cn(
    index === 0 ? 'bg-surface-raised' : 'bg-surface-alt',
    'border-l border-border',
    index === count - 1 && 'border-r border-border'
  );
}

export function ComparisonTable({ platforms, rows }: ComparisonTableProps) {
  const gridStyle = { '--compare-cols': platforms.length } as CSSProperties;
  const columnNames = platforms.map((p) => p.name).join(' vs ');

  return (
    <div
      role="table"
      aria-label={`Feature comparison: ${columnNames}`}
      className="relative z-10 animate-slide-up"
      style={gridStyle}
    >
      {/* Sticky platform header row */}
      <div
        role="rowgroup"
        className="sticky top-[var(--spacing-header-height)] z-20 bg-surface-90 backdrop-blur pb-px"
      >
        {/* Background extension to mask content under header */}
        <div className="absolute inset-x-0 -top-4 h-4 bg-surface" aria-hidden />

        <div role="row" className="compare-grid">
          <div role="columnheader" className="h-[100px] lg:h-[120px] bg-surface">
            <span className="sr-only">Feature</span>
          </div>

          {platforms.map((platform, index) => (
            <div
              key={platform.id}
              role="columnheader"
              className={cn(
                'h-[100px] lg:h-[120px] flex items-center justify-center overflow-hidden',
                valueColumnClasses(index, platforms.length)
              )}
            >
              <PlatformHeader
                platform={platform}
                size={platforms.length > 2 ? 'md' : 'lg'}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Feature rows — each row is a grid sharing the same template, so
          columns stay aligned while rows size to their content */}
      <div role="rowgroup" className="border-b border-border">
        {rows.map((row) => (
          <div key={row.feature.id} role="row" className="compare-grid">
            <div
              role="rowheader"
              className="bg-surface min-h-[92px] py-4 pr-4 lg:pr-6 flex flex-col justify-center border-t border-border"
            >
              <h3 className="text-[1.05rem] lg:text-[1.15rem] font-bold leading-[1.2] tracking-normal text-text-primary text-balance">
                {row.feature.name}
              </h3>
              <p className="mt-1 text-[0.78rem] lg:text-[0.82rem] leading-[1.45] text-text-muted max-w-[28ch]">
                {row.feature.description}
              </p>
            </div>

            {row.cells.map((cell, index) => (
              <div
                key={`${row.feature.id}-${platforms[index].id}`}
                role="cell"
                className={cn(
                  'min-h-[92px] p-3 lg:p-4 flex items-center justify-center border-t border-border',
                  valueColumnClasses(index, platforms.length)
                )}
              >
                <StatusIndicator
                  status={cell.status}
                  displayValue={cell.displayValue}
                  context={cell.context}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
