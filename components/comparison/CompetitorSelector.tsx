// components/comparison/CompetitorSelector.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from '@/components/ui/Icon';
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
          'inline-flex items-center gap-1.5 pb-1 font-black tracking-tight',
          'border-b transition-all duration-200',
          isOpen 
            ? 'border-audius-purple text-audius-purple' 
            : 'border-white/10 text-text-primary hover:text-audius-purple hover:border-white/20'
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span>{current.name}</span>
        <ChevronDownIcon 
          className={cn(
            'h-5 w-5 md:h-6 md:w-6 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} 
        />
      </button>
      
      {/* Dropdown menu */}
      <div 
        className={cn(
          'absolute left-1/2 -ml-[180px] top-full mt-1 z-50',
          'w-[360px] font-sans font-normal tracking-normal normal-case leading-normal',
          'transition-all duration-200 origin-top',
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        )}
        role="menu"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 py-2 shadow-2xl shadow-black/60">
          <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-2xl" />
          <div className="relative z-10">
            <div className="px-2">
              {options.map((option) => {
                const isSelected = option.slug === current.slug;
                
                return (
                  <button
                    key={option.slug}
                    onClick={() => handleSelect(option.slug)}
                    className={cn(
                      'flex w-full px-3 text-left rounded-xl transition-colors duration-150',
                      'items-start gap-3 py-3',
                      isSelected 
                        ? 'bg-audius-purple/15 text-white' 
                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                    )}
                    role="menuitem"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="text-sm font-sans font-semibold text-white">
                        {option.name}
                      </span>
                      <span className="mt-0.5 text-xs font-sans font-normal leading-relaxed text-neutral-500">
                        Audius versus {option.name}, side-by-side feature comparison.
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </span>
  );
}
