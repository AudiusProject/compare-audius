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
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-green-100 text-green-800',
        className
      )}
    >
      {isDraft ? 'Draft' : 'Published'}
    </span>
  );
}
