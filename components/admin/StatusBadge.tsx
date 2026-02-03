import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  isDraft: boolean;
  className?: string;
}

export function StatusBadge({ isDraft, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        isDraft
          ? 'bg-status-warn-bg text-status-warn'
          : 'bg-status-yes-bg text-status-yes',
        className
      )}
    >
      {isDraft ? 'Draft' : 'Published'}
    </span>
  );
}
