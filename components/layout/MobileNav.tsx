// components/layout/MobileNav.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EXTERNAL_URLS } from '@/lib/constants';
import {
  InstagramIcon,
  TwitterIcon,
  DiscordIcon,
  TelegramIcon,
  AudiusLogo,
} from '@/components/ui/Icon';
import type { Platform } from '@/types';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  competitors: Platform[];
}

export function MobileNav({ isOpen, onClose, competitors }: MobileNavProps) {
  const router = useRouter();

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

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-40 bg-overlay-95 backdrop-blur-xl flex flex-col justify-center px-6 sm:px-8 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden overflow-y-auto ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      <Link
        href="/"
        onClick={onClose}
        className="absolute top-4 left-4 sm:top-6 sm:left-6"
      >
        <AudiusLogo className="h-5 sm:h-6 w-auto text-text-muted-30 hover:text-text-primary transition-colors" />
      </Link>

      <nav className="flex flex-col gap-2 sm:gap-3 mb-10 font-titular-heavy">
        {competitors.map((competitor, index) => (
          <button
            key={competitor.slug}
            onClick={() => handleNavigation(`/${competitor.slug}`)}
            className="text-left text-[clamp(2.75rem,1.25rem+8vw,6.5rem)] font-black uppercase tracking-normal leading-[0.9] transition-all duration-300 text-text-primary hover:text-audius-purple"
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
              transform: isOpen ? 'translateX(0)' : 'translateX(-20px)',
              opacity: isOpen ? 1 : 0,
            }}
          >
            Audius vs. {competitor.name}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8 font-titular-heavy">
        <a
          href={EXTERNAL_URLS.blog}
          target="_blank"
          rel="noopener noreferrer"
          className="text-fluid-body-lg text-text-muted uppercase tracking-widest hover:text-audius-purple transition-colors"
        >
          Read The Blog
        </a>
        <a
          href={EXTERNAL_URLS.helpCenter}
          target="_blank"
          rel="noopener noreferrer"
          className="text-fluid-body-lg text-text-muted uppercase tracking-widest hover:text-audius-purple transition-colors"
        >
          Help Center
        </a>
      </div>

      <div className="flex items-center gap-5">
        <a
          href={EXTERNAL_URLS.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Instagram"
        >
          <InstagramIcon className="w-5 h-5" />
        </a>
        <a
          href={EXTERNAL_URLS.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Twitter"
        >
          <TwitterIcon className="w-5 h-5" />
        </a>
        <a
          href={EXTERNAL_URLS.discord}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Discord"
        >
          <DiscordIcon className="w-5 h-5" />
        </a>
        <a
          href={EXTERNAL_URLS.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Telegram"
        >
          <TelegramIcon className="w-5 h-5" />
        </a>
      </div>

      <a
        href={EXTERNAL_URLS.audiusApp}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 bg-cta text-cta-text font-titular-heavy font-bold uppercase text-[clamp(1.1rem,0.95rem+1.6vw,1.4rem)] tracking-widest hover:bg-audius-purple hover:text-text-primary transition-all self-start"
      >
        Open Audius
      </a>
    </div>
  );
}
