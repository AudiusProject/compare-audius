// components/ui/Dropdown.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from './Icon';

export interface DropdownItem {
  id: string;
  label: string;
  description?: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

export interface DropdownSection {
  title?: string;
  items: DropdownItem[];
}

interface DropdownProps {
  trigger: React.ReactNode;
  sections: DropdownSection[];
  align?: 'left' | 'right' | 'center';
  className?: string;
  dropdownClassName?: string;
  footer?: React.ReactNode;
  isActive?: boolean;
}

export function Dropdown({ 
  trigger, 
  sections, 
  align = 'left',
  className,
  dropdownClassName,
  footer,
  isActive,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsOpen(true);
  };

  const close = () => {
    closeTimeoutRef.current = setTimeout(() => setIsOpen(false), 120);
  };
  
  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);
  
  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };
  
  return (
    <div
      ref={dropdownRef}
      className={cn('relative inline-block', className)}
      onMouseEnter={open}
      onMouseLeave={close}
    >
      {/* Trigger button - matches header nav styling */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={cn(
          'relative flex items-center gap-1.5 py-2',
          'text-fluid-small font-bold tracking-[0.08em] transition-colors duration-150 focus-visible:outline-none',
          isOpen || isActive
            ? 'text-white'
            : 'text-neutral-400 hover:text-audius-purple'
        )}
      >
        {trigger}
        <ChevronDownIcon 
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} 
        />
        {isActive && !isOpen && (
          <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-audius-purple" />
        )}
      </button>
      
      {/* Dropdown panel */}
      <div 
        className={cn(
          'absolute z-50 mt-1',
          alignmentClasses[align],
          isOpen 
            ? 'visible pointer-events-auto'
            : 'invisible pointer-events-none',
          dropdownClassName
        )}
        role="menu"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/60 py-2">
          <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-2xl" />
          <div
            className={cn(
              'relative z-10 origin-top transition-all duration-200',
              isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2'
            )}
          >
            {sections.map((section, sectionIndex) => (
              <div key={`${section.title || 'section'}-${sectionIndex}`}>
                {/* Section divider (not for first section) */}
                {sectionIndex > 0 && (
                  <div className="border-t border-white/10 mx-3 my-2" />
                )}
                
                {/* Section title */}
                {section.title && (
                  <div className="px-5 py-2 text-xs font-semibold text-neutral-500 tracking-tight font-sans">
                    {section.title}
                  </div>
                )}
                
                {/* Items */}
                <div className="px-2 space-y-1">
                  {section.items.map((item) => (
                    <DropdownItemComponent 
                      key={item.id} 
                      item={item} 
                      onSelect={() => setIsOpen(false)}
                    />
                  ))}
                </div>
              </div>
            ))}
            {footer && (
              <>
                <div className="mx-3 my-2 border-t border-white/10" />
                <div className="px-2 pb-3 pt-1">
                  {footer}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DropdownItemComponent({ 
  item, 
  onSelect 
}: { 
  item: DropdownItem; 
  onSelect: () => void;
}) {
  const handleClick = () => {
    if (item.onClick) {
      item.onClick();
    }
    onSelect();
  };
  const hasDescription = Boolean(item.description);
  
  const itemClassName = cn(
    'flex w-full px-3 text-left rounded-xl transition-colors duration-150',
    hasDescription ? 'items-start gap-3 py-3' : 'items-center gap-2.5 py-2.5',
    item.isActive
      ? 'bg-audius-purple/15 text-white'
      : 'text-neutral-400 hover:bg-white/5 hover:text-white'
  );
  
  if (item.href) {
    const isInternal = item.href.startsWith('/');
    const content = (
      <>
        {item.icon && (
          <span className={cn(
            'text-text-muted flex-shrink-0',
            hasDescription && 'mt-0.5 w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center text-neutral-300'
          )}>
            {item.icon}
          </span>
        )}
        <span className="flex min-w-0 flex-col">
          <span className={cn(
            'text-sm font-sans',
            hasDescription ? 'font-semibold text-white' : 'font-medium'
          )}>
            {item.label}
          </span>
          {hasDescription && (
            <span className="text-xs text-neutral-500 mt-0.5 leading-relaxed font-sans">
              {item.description}
            </span>
          )}
        </span>
      </>
    );

    if (isInternal) {
      return (
        <Link 
          href={item.href}
          className={itemClassName}
          role="menuitem"
          onClick={onSelect}
        >
          {content}
        </Link>
      );
    }

    return (
      <a 
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={itemClassName}
        role="menuitem"
        onClick={onSelect}
      >
        {content}
      </a>
    );
  }
  
  return (
    <button className={itemClassName} role="menuitem" onClick={handleClick}>
      {item.icon && (
        <span className={cn(
          'text-text-muted flex-shrink-0',
          hasDescription && 'mt-0.5 w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center text-neutral-300'
        )}>
          {item.icon}
        </span>
      )}
      <span className="flex min-w-0 flex-col">
        <span className={cn(
          'text-sm font-sans',
          hasDescription ? 'font-semibold text-white' : 'font-medium'
        )}>
          {item.label}
        </span>
        {hasDescription && (
          <span className="text-xs text-neutral-500 mt-0.5 leading-relaxed font-sans">
            {item.description}
          </span>
        )}
      </span>
    </button>
  );
}
