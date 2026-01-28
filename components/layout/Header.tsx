// components/layout/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CompareDropdown } from './CompareDropdown';
import { MoreDropdown } from './MoreDropdown';
import { MobileNav } from './MobileNav';
import { EXTERNAL_URLS } from '@/lib/constants';
import { MenuIcon } from '@/components/ui/Icon';
import type { Platform } from '@/types';

// Audius logo from CDN (same as in platforms.json)
const AUDIUS_LOGO_URL = 'https://cdn.prod.website-files.com/67fec1eb88ef3de9adf4455c/6802c1954e5d6fc2ec61ccd4_y7vxxCf97wWfwEsRoz9xpn3cAsel2_X60gFP4PQnzF8.webp';

interface HeaderProps {
  competitors: Platform[];
}

export function Header({ competitors }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Header background with blur and shadow */}
      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm border-b border-border shadow-[var(--shadow-header)]" />
      
      <div className="container-wide relative">
        <div className="flex items-center justify-between h-[var(--spacing-header-height)]">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src={AUDIUS_LOGO_URL}
              alt="Audius"
              width={146}
              height={28}
              className="object-contain"
              priority
            />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center">
            <CompareDropdown competitors={competitors} />
            <MoreDropdown />
            
            {/* CTA Button */}
            <a
              href={EXTERNAL_URLS.audiusApp}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-6 px-5 py-3 bg-white border border-border text-audius-purple rounded-lg text-base font-medium hover:bg-surface-alt transition-colors"
            >
              Open Audius
            </a>
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 -mr-2" 
            aria-label="Open menu"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <MenuIcon className="text-text-secondary" />
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
        competitors={competitors}
      />
    </header>
  );
}
