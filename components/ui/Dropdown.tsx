// components/ui/Dropdown.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from './Icon';

export interface DropdownItem {
  id: string;
  label: string;
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
}

export function Dropdown({ 
  trigger, 
  sections, 
  align = 'left',
  className 
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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
  
  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };
  
  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      {/* Trigger button - matches header nav styling */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={cn(
          'flex items-center gap-1.5 px-4 py-4',
          'text-base font-medium transition-colors duration-150',
          isOpen 
            ? 'text-audius-purple' 
            : 'text-text-secondary hover:text-text-primary'
        )}
      >
        {trigger}
        <ChevronDownIcon 
          className={cn(
            'w-5 h-5 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} 
        />
      </button>
      
      {/* Dropdown panel */}
      <div 
        className={cn(
          'absolute z-50 mt-1 min-w-[220px] py-2',
          'bg-white rounded-xl border border-border',
          'shadow-lg shadow-black/10',
          'transition-all duration-200 origin-top',
          alignmentClasses[align],
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        )}
        role="menu"
      >
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {/* Section divider (not for first section) */}
            {sectionIndex > 0 && (
              <div className="border-t border-border my-2" />
            )}
            
            {/* Section title */}
            {section.title && (
              <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                {section.title}
              </div>
            )}
            
            {/* Items */}
            {section.items.map((item) => (
              <DropdownItemComponent 
                key={item.id} 
                item={item} 
                onSelect={() => setIsOpen(false)}
              />
            ))}
          </div>
        ))}
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
  
  const itemClassName = cn(
    'flex items-center gap-3 w-full px-4 py-2.5 text-left',
    'transition-colors duration-150',
    item.isActive
      ? 'bg-audius-purple/5 text-audius-purple font-medium'
      : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
  );
  
  if (item.href) {
    return (
      <a 
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={itemClassName}
        role="menuitem"
        onClick={onSelect}
      >
        {item.icon && <span className="text-text-muted">{item.icon}</span>}
        <span className="text-base">{item.label}</span>
      </a>
    );
  }
  
  return (
    <button className={itemClassName} role="menuitem" onClick={handleClick}>
      {item.icon && <span className="text-text-muted">{item.icon}</span>}
      <span className="text-base">{item.label}</span>
    </button>
  );
}
