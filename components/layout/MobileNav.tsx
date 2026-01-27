// components/layout/MobileNav.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EXTERNAL_URLS } from '@/lib/constants';
import { getCompetitors } from '@/lib/data';
import Image from 'next/image';
import { 
  CloseIcon, 
  InstagramIcon, 
  TwitterIcon, 
  DiscordIcon, 
  TelegramIcon,
  TikTokIcon 
} from '@/components/ui/Icon';

// Audius logo from CDN
const AUDIUS_LOGO_URL = 'https://cdn.prod.website-files.com/67fec1eb88ef3de9adf4455c/6802c1954e5d6fc2ec61ccd4_y7vxxCf97wWfwEsRoz9xpn3cAsel2_X60gFP4PQnzF8.webp';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const router = useRouter();
  const competitors = getCompetitors();

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Menu panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <Image
              src={AUDIUS_LOGO_URL}
              alt="Audius"
              width={146}
              height={28}
              className="object-contain"
            />
            <button 
              onClick={onClose}
              className="p-2 -mr-2"
              aria-label="Close menu"
            >
              <CloseIcon className="text-text-secondary" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto py-6 px-6">
            {/* Compare section */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
                Compare
              </h3>
              <nav className="space-y-1">
                {competitors.map(competitor => (
                  <button
                    key={competitor.slug}
                    onClick={() => handleNavigation(`/${competitor.slug}`)}
                    className="block w-full text-left px-3 py-3 text-base text-text-secondary hover:text-text-primary hover:bg-surface-alt rounded-lg transition-colors"
                  >
                    Audius vs. {competitor.name}
                  </button>
                ))}
              </nav>
            </div>
            
            {/* More section */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
                More
              </h3>
              <nav className="space-y-1">
                <a 
                  href={EXTERNAL_URLS.blog}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-3 text-base text-text-secondary hover:text-text-primary hover:bg-surface-alt rounded-lg transition-colors"
                >
                  Read The Blog
                </a>
                <a 
                  href={EXTERNAL_URLS.helpCenter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-3 text-base text-text-secondary hover:text-text-primary hover:bg-surface-alt rounded-lg transition-colors"
                >
                  Help Center
                </a>
              </nav>
            </div>
            
            {/* Social links */}
            <div>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
                Follow Us
              </h3>
              <div className="flex gap-4">
                <a 
                  href={EXTERNAL_URLS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-text-muted hover:text-text-primary transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-6 h-6" />
                </a>
                <a 
                  href={EXTERNAL_URLS.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-text-muted hover:text-text-primary transition-colors"
                  aria-label="Twitter"
                >
                  <TwitterIcon className="w-6 h-6" />
                </a>
                <a 
                  href={EXTERNAL_URLS.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-text-muted hover:text-text-primary transition-colors"
                  aria-label="Discord"
                >
                  <DiscordIcon className="w-6 h-6" />
                </a>
                <a 
                  href={EXTERNAL_URLS.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-text-muted hover:text-text-primary transition-colors"
                  aria-label="Telegram"
                >
                  <TelegramIcon className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Footer CTA */}
          <div className="p-6 border-t border-border">
            <a
              href={EXTERNAL_URLS.audiusApp}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-6 py-4 bg-audius-purple text-white text-center rounded-lg text-base font-medium hover:bg-audius-purple-dark transition-colors"
            >
              Open Audius
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
