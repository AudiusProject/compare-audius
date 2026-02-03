// components/layout/Header.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CompareDropdown } from './CompareDropdown';
import { MoreDropdown } from './MoreDropdown';
import { MobileNav } from './MobileNav';
import { EXTERNAL_URLS } from '@/lib/constants';
import { AudiusLogo, CloseIcon, MenuIcon } from '@/components/ui/Icon';
import type { Platform } from '@/types';

interface HeaderProps {
  competitors: Platform[];
}

export function Header({ competitors }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const handleChange = () => {
      if (media.matches) {
        setIsMobileMenuOpen(false);
      }
    };

    handleChange();
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-overlay-80 backdrop-blur-xl border-border py-3 md:py-4'
          : 'bg-transparent border-transparent py-4 md:py-6'
      }`}
    >
      <div className="container-wide flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center text-text-primary hover:text-audius-purple transition-colors">
            <AudiusLogo className="h-5 sm:h-6 md:h-7 w-auto" />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-10 font-titular-heavy">
            <CompareDropdown competitors={competitors} />
            <MoreDropdown />
            
            {/* CTA Button */}
            <a
              href={EXTERNAL_URLS.audiusApp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 xl:px-5 py-2 bg-cta text-cta-text font-bold uppercase text-fluid-body-lg tracking-widest hover:bg-audius-purple hover:text-text-primary transition-all whitespace-nowrap"
            >
              Open Audius
            </a>
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="lg:hidden p-2 -mr-2 text-text-primary hover:text-audius-purple transition-colors" 
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <CloseIcon className="text-current" />
            ) : (
              <MenuIcon className="text-current" />
            )}
          </button>
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
