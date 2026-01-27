// components/comparison/StatusIndicator.tsx
import { cn } from '@/lib/utils';
import { CheckIcon, XIcon, MinusIcon } from '@/components/ui/Icon';
import type { ComparisonStatus } from '@/types';

interface StatusIndicatorProps {
  status: ComparisonStatus;
  displayValue?: string | null;
  context?: string | null;
  className?: string;
}

export function StatusIndicator({ 
  status, 
  displayValue, 
  context,
  className 
}: StatusIndicatorProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {/* Custom value (like "320 kbps") */}
      {status === 'custom' && displayValue && (
        <span className="text-lg font-semibold text-text-primary">
          {displayValue}
        </span>
      )}
      
      {/* Yes - green checkmark */}
      {status === 'yes' && (
        <div className="w-6 h-6 rounded-full bg-status-yes flex items-center justify-center">
          <CheckIcon className="text-white w-4 h-4" />
        </div>
      )}
      
      {/* No - red X */}
      {status === 'no' && (
        <div className="w-6 h-6 rounded-full bg-status-no flex items-center justify-center">
          <XIcon className="text-white w-4 h-4" />
        </div>
      )}
      
      {/* Partial - gray dash with context */}
      {status === 'partial' && (
        <>
          <div className="w-6 h-6 rounded-full bg-status-partial flex items-center justify-center">
            <MinusIcon className="text-white w-4 h-4" />
          </div>
          {context && (
            <span className="text-status-context text-center max-w-[200px]">
              {context}
            </span>
          )}
        </>
      )}
    </div>
  );
}
