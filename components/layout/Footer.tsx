// components/layout/Footer.tsx
import Link from 'next/link';
import { EXTERNAL_URLS } from '@/lib/constants';
import {
  InstagramIcon,
  TwitterIcon,
  DiscordIcon,
  TikTokIcon,
  AudiusLogo,
  AudiusGlyph,
} from '@/components/ui/Icon';

const RESOURCE_LINKS = [
  { label: 'Audius.co', href: EXTERNAL_URLS.audiusApp },
  { label: 'Help Center', href: EXTERNAL_URLS.helpCenter },
  { label: 'Dev Docs', href: 'https://docs.audius.org' },
  { label: 'Blog', href: EXTERNAL_URLS.blog },
];

function SocialLinks({ className, size = 20 }: { className?: string; size?: number }) {
  const iconSizeClass = size >= 20 ? 'w-5 h-5' : 'w-[18px] h-[18px]';

  return (
    <div className={`flex items-center gap-5 ${className || ''}`}>
      <a
        href={EXTERNAL_URLS.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral-400 hover:text-white active:text-white focus-visible:outline-none focus-visible:text-white transition-colors"
        aria-label="Instagram"
      >
        <InstagramIcon className={iconSizeClass} />
      </a>
      <a
        href={EXTERNAL_URLS.discord}
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral-400 hover:text-white active:text-white focus-visible:outline-none focus-visible:text-white transition-colors"
        aria-label="Discord"
      >
        <DiscordIcon className={iconSizeClass} />
      </a>
      <a
        href="https://www.tiktok.com/@audius"
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral-400 hover:text-white active:text-white focus-visible:outline-none focus-visible:text-white transition-colors"
        aria-label="TikTok"
      >
        <TikTokIcon className={iconSizeClass} />
      </a>
      <a
        href={EXTERNAL_URLS.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral-400 hover:text-white active:text-white focus-visible:outline-none focus-visible:text-white transition-colors"
        aria-label="X (Twitter)"
      >
        <TwitterIcon className={iconSizeClass} />
      </a>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-black">
      <div className="page-shell">
        {/* Main Footer Content */}
        <div className="py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            {/* Logo & Tagline */}
            <div className="lg:col-span-5">
              <Link href="/" className="inline-block mb-6">
                <AudiusLogo className="h-8 sm:h-10 w-auto text-white hover:text-audius-purple transition-colors duration-300" />
              </Link>
              <p className="text-neutral-500 text-sm leading-relaxed max-w-sm">
                Find your people.
                <br />
                Grow your scene.
              </p>
            </div>

            {/* Resources */}
            <div className="lg:col-span-4">
              <h4 className="text-fluid-small font-bold tracking-[0.08em] text-white mb-6">
                Resources
              </h4>
              <ul className="grid grid-cols-2 gap-x-8 gap-y-4">
                {RESOURCE_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-neutral-400 hover:text-white focus-visible:outline-none focus-visible:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div className="lg:col-span-3">
              <h4 className="text-fluid-small font-bold tracking-[0.08em] text-white mb-6">
                Follow Us
              </h4>
              <SocialLinks className="flex-wrap" size={20} />
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/5 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 text-neutral-600">
              <AudiusGlyph className="w-4 h-4" />
              <span className="text-fluid-small font-mono tracking-[0.08em]">
                &copy; {new Date().getFullYear()} Audius, Inc.
              </span>
            </div>
            <div className="flex items-center gap-6 text-fluid-small font-mono tracking-[0.08em] text-neutral-600">
              <a
                href={EXTERNAL_URLS.privacyPolicy}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white focus-visible:outline-none focus-visible:text-white transition-colors"
              >
                Privacy
              </a>
              <a
                href={EXTERNAL_URLS.termsOfService}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white focus-visible:outline-none focus-visible:text-white transition-colors"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
