// components/comparison/CompetitorSelector.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronDownIcon, CheckIcon } from '@/components/ui/Icon';
import type { Platform } from '@/types';

interface CompetitorSelectorProps {
  current: Platform;
  options: Platform[];
}

export function CompetitorSelector({ current, options }: CompetitorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);
  
  const handleSelect = (slug: string) => {
    setIsOpen(false);
    if (slug !== current.slug) {
      router.push(`/${slug}`);
    }
  };
  
  return (
    <span ref={ref} className="relative inline-block">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-2 pb-1',
          'border-b transition-all duration-200',
          isOpen 
            ? 'border-audius-purple text-text-primary' 
            : 'border-border-light text-audius-purple hover:text-text-primary hover:border-border'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{current.name}</span>
        <ChevronDownIcon 
          className={cn(
            'w-6 h-6 md:w-7 md:h-7 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} 
        />
      </button>
      
      {/* Dropdown menu */}
      <div 
        className={cn(
          'absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50',
          'min-w-[220px] py-2 bg-surface-alt-95 backdrop-blur rounded-2xl border border-border',
          'shadow-[var(--shadow-dropdown)]',
          'transition-all duration-200 origin-top',
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        )}
        role="listbox"
      >
        <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-widest">
          Compare with
        </div>
        
        {options.map((option) => {
          const isSelected = option.slug === current.slug;
          
          return (
            <button
              key={option.slug}
              onClick={() => handleSelect(option.slug)}
              className={cn(
                'w-full px-3 py-2.5 text-left flex items-center justify-between gap-3',
                'transition-colors duration-150',
                isSelected 
                  ? 'bg-audius-purple/15 text-text-primary font-medium' 
                  : 'text-text-secondary hover:bg-tint-05 hover:text-text-primary'
              )}
              role="option"
              aria-selected={isSelected}
            >
              <span className="text-base">{option.name}</span>
              {isSelected && (
                <CheckIcon className="w-5 h-5 text-audius-purple" />
              )}
            </button>
          );
        })}
      </div>
    </span>
  );
}
