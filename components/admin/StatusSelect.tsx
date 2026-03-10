'use client';

import { cn } from '@/lib/utils';

type Status = 'yes' | 'no' | 'partial' | 'custom';

interface StatusSelectProps {
  value: Status;
  onChange: (status: Status) => void;
  disabled?: boolean;
}

export function StatusSelect({ value, onChange, disabled }: StatusSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Status)}
      disabled={disabled}
      className={cn(
        'px-3 py-1.5 border border-border rounded-lg text-sm bg-surface text-text-primary',
        'focus:ring-2 focus:ring-audius-purple focus:border-transparent',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      )}
    >
      <option value="yes">Yes</option>
      <option value="no">No</option>
      <option value="partial">Partial</option>
      <option value="custom">Custom</option>
    </select>
  );
}
