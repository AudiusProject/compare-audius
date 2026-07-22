// components/comparison/StatusIndicator.tsx
import { cn } from '@/lib/utils';
import { CheckIcon, XIcon, MinusIcon } from '@/components/ui/Icon';
import type { ComparisonStatus } from '@/types';

interface StatusIndicatorProps {
  status: ComparisonStatus;
  displayValue?: string | null;
  context?: string | null;
  className?: string;
  /** Compact mode for mobile - smaller text, constrained width */
  compact?: boolean;
  align?: 'center' | 'end';
}

const STATUS_ICONS = {
  yes: { bg: 'bg-status-yes', Icon: CheckIcon, label: 'Yes' },
  no: { bg: 'bg-status-no', Icon: XIcon, label: 'No' },
  partial: { bg: 'bg-status-partial', Icon: MinusIcon, label: 'Partially' },
} as const;

/**
 * The single renderer for a comparison cell (desktop table + mobile cards).
 * Shows the status icon or custom value, with `context` as subtext for any
 * status that has it.
 */
export function StatusIndicator({
  status,
  displayValue,
  context,
  className,
  compact = false,
  align = 'center',
}: StatusIndicatorProps) {
  const alignment = align === 'end' ? 'items-end text-right' : 'items-center text-center';
  const contextAlignment = align === 'end' ? 'text-right' : 'text-center';
  const icon = status === 'yes' || status === 'no' || status === 'partial'
    ? STATUS_ICONS[status]
    : null;

  return (
    <div className={cn('flex flex-col gap-1.5', alignment, className)}>
      {/* Custom value (like "320 kbps") */}
      {status === 'custom' && displayValue && (
        <span className={cn(
          'font-semibold font-mono text-text-primary',
          compact ? 'text-sm' : 'text-base lg:text-[1.05rem]'
        )}>
          {displayValue}
        </span>
      )}

      {icon && (
        <div className={cn('w-6 h-6 rounded-full flex items-center justify-center', icon.bg)}>
          <icon.Icon className="text-on-status w-4 h-4" aria-hidden />
          <span className="sr-only">{icon.label}</span>
        </div>
      )}

      {/* Context reads as a footnote: smaller and quieter than the feature
          copy, wide enough to wrap in 1–2 lines instead of a tall stack */}
      {context && (
        <span className={cn(
          contextAlignment,
          compact
            ? 'text-xs leading-snug max-w-[180px] sm:max-w-[220px] text-text-muted'
            : 'text-[0.72rem] lg:text-[0.78rem] leading-[1.4] text-text-muted max-w-[200px] lg:max-w-[280px]'
        )}>
          {context}
        </span>
      )}
    </div>
  );
}
