# Frontend Implementation Plan

> **Parent Document:** [PROJECT_PLAN.md](./PROJECT_PLAN.md)  
> **Scope:** All UI components, styling, responsive design, polish  
> **Depends On:** [PLAN_BACKEND.md](./PLAN_BACKEND.md) (must be complete first)  
> **Figma:** https://www.figma.com/design/00i0TtJXSpNoT3tqKvbp6O/Compare.audius

---

## Overview

Build all UI components matching the Figma designs. The data layer and routing are already set up—this plan focuses purely on visual implementation.

---

## Prerequisites

Before starting, verify backend is complete:

```bash
# These should all pass
npm run dev          # Starts without errors
npm run type-check   # No TypeScript errors
```

Verify these files exist:
- `types/index.ts` - Type definitions
- `lib/data.ts` - Data utilities
- `lib/constants.ts` - External URLs
- `lib/utils.ts` - Helper utilities (cn function)
- `data/platforms.json` - Platform data
- `data/features.json` - Feature data  
- `data/comparisons.json` - Comparison data

---

## Figma Reference

| Layout | URL | Breakpoint |
|--------|-----|------------|
| Desktop - SoundCloud | [node-id=1-2](https://www.figma.com/design/00i0TtJXSpNoT3tqKvbp6O/Compare.audius?node-id=1-2) | ≥768px |
| Mobile - SoundCloud | [node-id=1-425](https://www.figma.com/design/00i0TtJXSpNoT3tqKvbp6O/Compare.audius?node-id=1-425) | <768px |
| Desktop - Spotify | [node-id=1-914](https://www.figma.com/design/00i0TtJXSpNoT3tqKvbp6O/Compare.audius?node-id=1-914) | ≥768px |
| Mobile - Spotify | [node-id=1-1335](https://www.figma.com/design/00i0TtJXSpNoT3tqKvbp6O/Compare.audius?node-id=1-1335) | <768px |

Use Figma Dev Mode to extract exact values for colors, spacing, typography.

---

## Deliverables

| # | Component | File | Priority |
|---|-----------|------|----------|
| 1 | Tailwind config | `tailwind.config.ts` | High |
| 2 | Global styles | `app/globals.css` | High |
| 3 | Dropdown primitive | `components/ui/Dropdown.tsx` | High |
| 4 | Header | `components/layout/Header.tsx` | High |
| 5 | Footer | `components/layout/Footer.tsx` | High |
| 6 | CompareDropdown | `components/layout/CompareDropdown.tsx` | High |
| 7 | MoreDropdown | `components/layout/MoreDropdown.tsx` | High |
| 8 | StatusIndicator | `components/comparison/StatusIndicator.tsx` | High |
| 9 | PlatformHeader | `components/comparison/PlatformHeader.tsx` | High |
| 10 | FeatureRow | `components/comparison/FeatureRow.tsx` | High |
| 11 | ComparisonTable | `components/comparison/ComparisonTable.tsx` | High |
| 12 | FeatureCard | `components/comparison/FeatureCard.tsx` | High |
| 13 | ComparisonCards | `components/comparison/ComparisonCards.tsx` | High |
| 14 | PageHeader | `components/comparison/PageHeader.tsx` | High |
| 15 | CompetitorSelector | `components/comparison/CompetitorSelector.tsx` | High |
| 16 | ComparisonPage | `components/comparison/ComparisonPage.tsx` | High |
| 17 | Layout integration | `app/layout.tsx` | High |
| 18 | Page integration | `app/page.tsx`, `app/[competitor]/page.tsx` | High |

---

## Task 1: Tailwind Configuration

### 1.1 Update `tailwind.config.ts`

Extract exact colors from Figma and update:

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand - extract from Figma
        audius: {
          purple: '#7E1BCC',      // Primary purple
          'purple-dark': '#6B18AE', // Hover state
          'purple-light': '#9935E8', // Light variant
        },
        // Status indicators
        status: {
          yes: '#0F9D58',        // Green - extract exact from Figma
          no: '#DB4437',         // Red - extract exact from Figma  
          partial: '#9E9E9E',    // Gray - extract exact from Figma
        },
        // UI colors
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F8F8F8',        // Alternating row background
        },
        border: {
          DEFAULT: '#E5E5E5',
          light: '#F0F0F0',
        },
      },
      fontFamily: {
        // Check Figma for font family - likely Inter or Avenir
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        // Match Figma typography scale
        'page-title': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'section-title': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'feature-name': ['1rem', { lineHeight: '1.4', fontWeight: '600' }],
        'feature-desc': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'status-context': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        // Add any custom spacing values from Figma
        'header-height': '72px',
      },
      borderRadius: {
        // Match Figma border radius values
      },
      boxShadow: {
        // Match Figma shadow values for dropdowns, cards, etc.
        'dropdown': '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
```

### 1.2 Update `app/globals.css`

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* Import fonts if needed - check Figma */
  /* @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); */
  
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply text-gray-900 bg-white antialiased;
  }
}

@layer components {
  /* Reusable component styles */
  
  .container-narrow {
    @apply max-w-4xl mx-auto px-4;
  }
  
  .container-wide {
    @apply max-w-6xl mx-auto px-4;
  }
  
  /* Purple dotted underline for CompetitorSelector */
  .competitor-selector-trigger {
    @apply border-b-2 border-dotted border-audius-purple cursor-pointer;
    @apply hover:border-audius-purple-dark transition-colors;
  }
}

@layer utilities {
  /* Custom utilities */
}
```

---

## Task 2: UI Primitives

### 2.1 Create `components/ui/Dropdown.tsx`

```typescript
// components/ui/Dropdown.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface DropdownItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
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
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-1"
      >
        {trigger}
        <ChevronIcon className={cn('transition-transform', isOpen && 'rotate-180')} />
      </button>
      
      {/* Dropdown panel */}
      {isOpen && (
        <div 
          className={cn(
            'absolute z-50 mt-2 min-w-[200px] py-2',
            'bg-white rounded-lg shadow-dropdown border border-border-light',
            alignmentClasses[align]
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
                <div className="px-4 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
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
      )}
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
  
  const className = cn(
    'flex items-center gap-3 w-full px-4 py-2 text-left',
    'hover:bg-gray-50 transition-colors',
    'text-sm text-gray-700 hover:text-gray-900'
  );
  
  if (item.href) {
    return (
      <a 
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        role="menuitem"
        onClick={onSelect}
      >
        {item.icon}
        {item.label}
      </a>
    );
  }
  
  return (
    <button className={className} role="menuitem" onClick={handleClick}>
      {item.icon}
      {item.label}
    </button>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={cn('w-4 h-4', className)} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
```

### 2.2 Create `components/ui/Icon.tsx`

```typescript
// components/ui/Icon.tsx
import { cn } from '@/lib/utils';

interface IconProps {
  className?: string;
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg className={cn('w-5 h-5', className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg className={cn('w-5 h-5', className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
  );
}

export function MinusIcon({ className }: IconProps) {
  return (
    <svg className={cn('w-5 h-5', className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 13H5v-2h14v2z" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// Social icons
export function InstagramIcon({ className }: IconProps) {
  return (
    <svg className={cn('w-5 h-5', className)} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

export function TwitterIcon({ className }: IconProps) {
  return (
    <svg className={cn('w-5 h-5', className)} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

export function DiscordIcon({ className }: IconProps) {
  return (
    <svg className={cn('w-5 h-5', className)} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

export function TelegramIcon({ className }: IconProps) {
  return (
    <svg className={cn('w-5 h-5', className)} fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}
```

---

## Task 3: Layout Components

### 3.1 Create `components/layout/Header.tsx`

```typescript
// components/layout/Header.tsx
import Link from 'next/link';
import Image from 'next/image';
import { CompareDropdown } from './CompareDropdown';
import { MoreDropdown } from './MoreDropdown';
import { EXTERNAL_URLS } from '@/lib/constants';

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="container-wide">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            {/* TODO: Add Audius logo - check Figma for exact SVG or use text */}
            <span className="text-xl font-bold text-audius-purple">AUDIUS</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <CompareDropdown />
            <MoreDropdown />
            
            {/* CTA Button */}
            <a
              href={EXTERNAL_URLS.audiusApp}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-audius-purple text-white rounded-full text-sm font-medium hover:bg-audius-purple-dark transition-colors"
            >
              Open Audius
            </a>
          </nav>
          
          {/* Mobile menu button */}
          <button className="md:hidden p-2" aria-label="Open menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* TODO: Mobile navigation drawer */}
    </header>
  );
}
```

### 3.2 Create `components/layout/CompareDropdown.tsx`

```typescript
// components/layout/CompareDropdown.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Dropdown, type DropdownSection } from '@/components/ui/Dropdown';
import { getCompetitors } from '@/lib/data';

export function CompareDropdown() {
  const router = useRouter();
  const competitors = getCompetitors();
  
  const sections: DropdownSection[] = [
    {
      items: competitors.map(competitor => ({
        id: competitor.slug,
        label: `Audius vs. ${competitor.name}`,
        onClick: () => router.push(`/${competitor.slug}`),
      })),
    },
  ];
  
  return (
    <Dropdown
      trigger={<span className="text-sm font-medium">Compare</span>}
      sections={sections}
      align="left"
    />
  );
}
```

### 3.3 Create `components/layout/MoreDropdown.tsx`

```typescript
// components/layout/MoreDropdown.tsx
'use client';

import { Dropdown, type DropdownSection } from '@/components/ui/Dropdown';
import { EXTERNAL_URLS } from '@/lib/constants';
import { InstagramIcon, TwitterIcon, DiscordIcon, TelegramIcon } from '@/components/ui/Icon';

export function MoreDropdown() {
  const sections: DropdownSection[] = [
    {
      items: [
        { id: 'blog', label: 'Read The Blog', href: EXTERNAL_URLS.blog },
        { id: 'help', label: 'Help Center', href: EXTERNAL_URLS.helpCenter },
      ],
    },
    {
      title: 'Follow Us',
      items: [
        { id: 'instagram', label: 'Instagram', href: EXTERNAL_URLS.instagram, icon: <InstagramIcon /> },
        { id: 'twitter', label: 'Twitter', href: EXTERNAL_URLS.twitter, icon: <TwitterIcon /> },
        { id: 'discord', label: 'Discord', href: EXTERNAL_URLS.discord, icon: <DiscordIcon /> },
        { id: 'telegram', label: 'Telegram', href: EXTERNAL_URLS.telegram, icon: <TelegramIcon /> },
      ],
    },
  ];
  
  return (
    <Dropdown
      trigger={<span className="text-sm font-medium">More</span>}
      sections={sections}
      align="left"
    />
  );
}
```

### 3.4 Create `components/layout/Footer.tsx`

```typescript
// components/layout/Footer.tsx
import Link from 'next/link';
import { EXTERNAL_URLS } from '@/lib/constants';
import { InstagramIcon, TwitterIcon, DiscordIcon, TelegramIcon } from '@/components/ui/Icon';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div>
            {/* TODO: Add Audius logo (white version) */}
            <span className="text-xl font-bold">AUDIUS</span>
            
            {/* Social links */}
            <div className="flex gap-4 mt-4">
              <a href={EXTERNAL_URLS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramIcon className="text-gray-400 hover:text-white transition-colors" />
              </a>
              <a href={EXTERNAL_URLS.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <TwitterIcon className="text-gray-400 hover:text-white transition-colors" />
              </a>
              <a href={EXTERNAL_URLS.discord} target="_blank" rel="noopener noreferrer" aria-label="Discord">
                <DiscordIcon className="text-gray-400 hover:text-white transition-colors" />
              </a>
              <a href={EXTERNAL_URLS.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                <TelegramIcon className="text-gray-400 hover:text-white transition-colors" />
              </a>
            </div>
          </div>
          
          {/* Audius column */}
          <div>
            <h3 className="font-semibold mb-4">Audius</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href={EXTERNAL_URLS.audiusMusic} className="hover:text-white">Launch the App</a></li>
              <li><a href={EXTERNAL_URLS.download} className="hover:text-white">Download</a></li>
              <li><a href={EXTERNAL_URLS.helpCenter} className="hover:text-white">Help Center</a></li>
            </ul>
          </div>
          
          {/* Resources column */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href={EXTERNAL_URLS.blog} className="hover:text-white">Blog</a></li>
              <li><a href={EXTERNAL_URLS.events} className="hover:text-white">Events</a></li>
              <li><a href={EXTERNAL_URLS.merchStore} className="hover:text-white">Merch Store</a></li>
              <li><a href={EXTERNAL_URLS.brandPress} className="hover:text-white">Brand / Press</a></li>
            </ul>
          </div>
          
          {/* Company column */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href={EXTERNAL_URLS.engineering} className="hover:text-white">Engineering</a></li>
              <li><a href={EXTERNAL_URLS.openAudioFoundation} className="hover:text-white">Open Audio Foundation</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom row */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Audius Music. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href={EXTERNAL_URLS.termsOfService} className="hover:text-white">Terms of Service</a>
            <a href={EXTERNAL_URLS.privacyPolicy} className="hover:text-white">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

## Task 4: Comparison Components

### 4.1 Create `components/comparison/StatusIndicator.tsx`

```typescript
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
    <div className={cn('flex flex-col items-center gap-1', className)}>
      {/* Icon or custom value */}
      {status === 'yes' && (
        <div className="w-8 h-8 rounded-full bg-status-yes flex items-center justify-center">
          <CheckIcon className="text-white w-5 h-5" />
        </div>
      )}
      
      {status === 'no' && (
        <div className="w-8 h-8 rounded-full bg-status-no flex items-center justify-center">
          <XIcon className="text-white w-5 h-5" />
        </div>
      )}
      
      {status === 'partial' && (
        <>
          <div className="w-8 h-8 rounded-full bg-status-partial flex items-center justify-center">
            <MinusIcon className="text-white w-5 h-5" />
          </div>
          {context && (
            <span className="text-status-context text-status-partial text-center max-w-[150px]">
              {context}
            </span>
          )}
        </>
      )}
      
      {status === 'custom' && displayValue && (
        <span className="text-sm font-medium text-gray-700">
          {displayValue}
        </span>
      )}
    </div>
  );
}
```

### 4.2 Create `components/comparison/PlatformHeader.tsx`

```typescript
// components/comparison/PlatformHeader.tsx
import Image from 'next/image';
import type { Platform } from '@/types';

interface PlatformHeaderProps {
  platform: Platform;
  className?: string;
}

export function PlatformHeader({ platform, className }: PlatformHeaderProps) {
  return (
    <div className={className}>
      <Image
        src={platform.logo}
        alt={platform.name}
        width={120}
        height={40}
        className="object-contain"
      />
    </div>
  );
}
```

### 4.3 Create `components/comparison/FeatureRow.tsx`

```typescript
// components/comparison/FeatureRow.tsx
import { cn } from '@/lib/utils';
import { StatusIndicator } from './StatusIndicator';
import type { FeatureComparison } from '@/types';

interface FeatureRowProps {
  comparison: FeatureComparison;
  isAlternate?: boolean;
}

export function FeatureRow({ comparison, isAlternate }: FeatureRowProps) {
  const { feature, audius, competitor } = comparison;
  
  return (
    <div 
      className={cn(
        'grid grid-cols-3 gap-4 py-6 px-4',
        isAlternate ? 'bg-surface-alt' : 'bg-surface'
      )}
    >
      {/* Feature info */}
      <div>
        <h3 className="text-feature-name">{feature.name}</h3>
        <p className="text-feature-desc text-gray-500 mt-1">
          {feature.description}
        </p>
      </div>
      
      {/* Audius status */}
      <div className="flex justify-center items-center">
        <StatusIndicator
          status={audius.status}
          displayValue={audius.displayValue}
          context={audius.context}
        />
      </div>
      
      {/* Competitor status */}
      <div className="flex justify-center items-center">
        <StatusIndicator
          status={competitor.status}
          displayValue={competitor.displayValue}
          context={competitor.context}
        />
      </div>
    </div>
  );
}
```

### 4.4 Create `components/comparison/ComparisonTable.tsx`

```typescript
// components/comparison/ComparisonTable.tsx
import { PlatformHeader } from './PlatformHeader';
import { FeatureRow } from './FeatureRow';
import { getAudius } from '@/lib/data';
import type { Platform, FeatureComparison } from '@/types';

interface ComparisonTableProps {
  competitor: Platform;
  comparisons: FeatureComparison[];
}

export function ComparisonTable({ competitor, comparisons }: ComparisonTableProps) {
  const audius = getAudius();
  
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-3 gap-4 py-6 px-4 bg-white border-b border-border">
        {/* Empty cell for feature column */}
        <div />
        
        {/* Platform headers */}
        <PlatformHeader platform={audius} className="flex justify-center" />
        <PlatformHeader platform={competitor} className="flex justify-center" />
      </div>
      
      {/* Feature rows */}
      {comparisons.map((comparison, index) => (
        <FeatureRow
          key={comparison.feature.id}
          comparison={comparison}
          isAlternate={index % 2 === 1}
        />
      ))}
    </div>
  );
}
```

### 4.5 Create `components/comparison/FeatureCard.tsx`

```typescript
// components/comparison/FeatureCard.tsx
import { StatusIndicator } from './StatusIndicator';
import { PlatformHeader } from './PlatformHeader';
import { getAudius } from '@/lib/data';
import type { Platform, FeatureComparison } from '@/types';

interface FeatureCardProps {
  comparison: FeatureComparison;
  competitor: Platform;
}

export function FeatureCard({ comparison, competitor }: FeatureCardProps) {
  const audius = getAudius();
  const { feature, audius: audiusStatus, competitor: competitorStatus } = comparison;
  
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-white">
      {/* Feature header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-feature-name">{feature.name}</h3>
        <p className="text-feature-desc text-gray-500 mt-1">
          {feature.description}
        </p>
      </div>
      
      {/* Audius section */}
      <div className="p-4 border-b border-border-light flex items-center justify-between">
        <PlatformHeader platform={audius} />
        <StatusIndicator
          status={audiusStatus.status}
          displayValue={audiusStatus.displayValue}
          context={audiusStatus.context}
        />
      </div>
      
      {/* Competitor section */}
      <div className="p-4 flex items-center justify-between">
        <PlatformHeader platform={competitor} />
        <StatusIndicator
          status={competitorStatus.status}
          displayValue={competitorStatus.displayValue}
          context={competitorStatus.context}
        />
      </div>
    </div>
  );
}
```

### 4.6 Create `components/comparison/ComparisonCards.tsx`

```typescript
// components/comparison/ComparisonCards.tsx
import { FeatureCard } from './FeatureCard';
import type { Platform, FeatureComparison } from '@/types';

interface ComparisonCardsProps {
  competitor: Platform;
  comparisons: FeatureComparison[];
}

export function ComparisonCards({ competitor, comparisons }: ComparisonCardsProps) {
  return (
    <div className="space-y-4">
      {comparisons.map((comparison) => (
        <FeatureCard
          key={comparison.feature.id}
          comparison={comparison}
          competitor={competitor}
        />
      ))}
    </div>
  );
}
```

### 4.7 Create `components/comparison/CompetitorSelector.tsx`

```typescript
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
    router.push(`/${slug}`);
  };
  
  return (
    <span ref={ref} className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'competitor-selector-trigger',
          'inline-flex items-center gap-1'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {current.name}
        <ChevronDownIcon className={cn('transition-transform', isOpen && 'rotate-180')} />
      </button>
      
      {isOpen && (
        <div 
          className="absolute left-0 top-full mt-2 min-w-[180px] py-2 bg-white rounded-lg shadow-dropdown border border-border-light z-50"
          role="listbox"
        >
          {options.map((option) => (
            <button
              key={option.slug}
              onClick={() => handleSelect(option.slug)}
              className={cn(
                'w-full px-4 py-2 text-left text-sm',
                'hover:bg-gray-50 transition-colors',
                option.slug === current.slug && 'font-medium text-audius-purple'
              )}
              role="option"
              aria-selected={option.slug === current.slug}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
```

### 4.8 Create `components/comparison/PageHeader.tsx`

```typescript
// components/comparison/PageHeader.tsx
import { CompetitorSelector } from './CompetitorSelector';
import type { Platform } from '@/types';

interface PageHeaderProps {
  competitor: Platform;
  competitors: Platform[];
}

export function PageHeader({ competitor, competitors }: PageHeaderProps) {
  return (
    <div className="text-center mb-12">
      {/* Badge */}
      <span className="inline-block px-3 py-1 text-xs font-medium text-audius-purple bg-audius-purple/10 rounded-full mb-4">
        Compare
      </span>
      
      {/* Title with selector */}
      <h1 className="text-page-title">
        Audius vs.{' '}
        <CompetitorSelector current={competitor} options={competitors} />
      </h1>
      
      {/* Subtitle */}
      <p className="text-gray-500 mt-4 max-w-md mx-auto">
        See how we stack up against the bigger fish.
      </p>
    </div>
  );
}
```

### 4.9 Create `components/comparison/ComparisonPage.tsx`

```typescript
// components/comparison/ComparisonPage.tsx
import { PageHeader } from './PageHeader';
import { ComparisonTable } from './ComparisonTable';
import { ComparisonCards } from './ComparisonCards';
import type { ComparisonPageProps } from '@/types';

export function ComparisonPage({ 
  competitor, 
  competitors, 
  comparisons 
}: ComparisonPageProps) {
  return (
    <div className="container-narrow py-12">
      <PageHeader 
        competitor={competitor}
        competitors={competitors}
      />
      
      {/* Desktop view */}
      <div className="hidden md:block">
        <ComparisonTable 
          competitor={competitor}
          comparisons={comparisons}
        />
      </div>
      
      {/* Mobile view */}
      <div className="md:hidden">
        <ComparisonCards 
          competitor={competitor}
          comparisons={comparisons}
        />
      </div>
    </div>
  );
}
```

---

## Task 5: Page Integration

### 5.1 Update `app/layout.tsx`

```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Audius vs The Industry | Compare Features',
    template: '%s | Audius Compare',
  },
  description: 'See how Audius compares to Spotify, SoundCloud, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

### 5.2 Update `app/page.tsx`

```typescript
// app/page.tsx
import { ComparisonPage } from '@/components/comparison/ComparisonPage';
import { getComparisonData, getPlatform, getCompetitors } from '@/lib/data';
import { DEFAULT_COMPETITOR } from '@/lib/constants';

export default async function HomePage() {
  const competitor = getPlatform(DEFAULT_COMPETITOR)!;
  const competitors = getCompetitors();
  const comparisons = getComparisonData(DEFAULT_COMPETITOR);
  
  return (
    <ComparisonPage 
      competitor={competitor}
      competitors={competitors}
      comparisons={comparisons}
    />
  );
}
```

### 5.3 Update `app/[competitor]/page.tsx`

```typescript
// app/[competitor]/page.tsx
import { notFound } from 'next/navigation';
import { ComparisonPage } from '@/components/comparison/ComparisonPage';
import { 
  getComparisonData, 
  getPlatform, 
  getCompetitors,
  getCompetitorSlugs,
  isValidCompetitor 
} from '@/lib/data';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  return getCompetitorSlugs().map(slug => ({ competitor: slug }));
}

export async function generateMetadata({ 
  params 
}: { 
  params: { competitor: string } 
}): Promise<Metadata> {
  const competitor = getPlatform(params.competitor);
  if (!competitor) return {};
  
  return {
    title: `Audius vs ${competitor.name}`,
    description: `Compare Audius and ${competitor.name}. See streaming quality, features, and more.`,
  };
}

export default async function CompetitorPage({ 
  params 
}: { 
  params: { competitor: string } 
}) {
  if (!isValidCompetitor(params.competitor)) {
    notFound();
  }
  
  const competitor = getPlatform(params.competitor)!;
  const competitors = getCompetitors();
  const comparisons = getComparisonData(params.competitor);
  
  return (
    <ComparisonPage 
      competitor={competitor}
      competitors={competitors}
      comparisons={comparisons}
    />
  );
}
```

---

## Task 6: Polish & Verification

### 6.1 Design Verification Checklist

Compare each component against Figma:

- [ ] **Colors**: Extract and verify all color values match
- [ ] **Typography**: Font family, sizes, weights, line heights
- [ ] **Spacing**: Padding, margins, gaps between elements
- [ ] **Border radius**: All rounded corners match
- [ ] **Shadows**: Dropdown shadows, card shadows
- [ ] **Icons**: Status icons match exactly
- [ ] **Logo rendering**: Platform logos display correctly

### 6.2 Responsive Verification

- [ ] Desktop (1440px): Matches "Web" Figma layouts
- [ ] Tablet (768px-1024px): Graceful transition
- [ ] Mobile (375px): Matches "Mobile" Figma layouts
- [ ] No horizontal scroll at any breakpoint
- [ ] Touch targets ≥ 44px on mobile

### 6.3 Interaction Verification

- [ ] All dropdowns open/close correctly
- [ ] CompetitorSelector navigates to correct route
- [ ] External links open in new tab
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus states are visible

### 6.4 Build Verification

```bash
npm run build    # Should complete without errors
npm run start    # Test production build locally
```

### 6.5 Lighthouse Targets

Run Lighthouse on production build:

- [ ] Performance: > 90
- [ ] Accessibility: > 95
- [ ] Best Practices: > 90
- [ ] SEO: > 90

---

## Common Issues & Solutions

### Images not loading

```typescript
// next.config.ts - add remote patterns for external images
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
      },
    ],
  },
};
```

### Hydration mismatch with dropdowns

Ensure dropdown state is only managed on client:

```typescript
'use client'; // Required for components with useState
```

### Fonts not loading

Add font import to `globals.css` or use `next/font`:

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// Apply to body
<body className={inter.className}>
```

---

## Handoff Notes

When frontend is complete:

1. **All routes functional**: `/`, `/soundcloud`, `/spotify`
2. **Responsive**: Desktop and mobile layouts match Figma
3. **Accessible**: Keyboard navigation, proper ARIA attributes
4. **Build passes**: No TypeScript errors, clean production build
5. **Performance**: Lighthouse scores meet targets

Ready for deployment phase.
