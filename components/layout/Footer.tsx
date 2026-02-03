// components/layout/Footer.tsx
import { EXTERNAL_URLS } from '@/lib/constants';
import { 
  InstagramIcon, 
  TwitterIcon, 
  DiscordIcon, 
  TelegramIcon,
  TikTokIcon,
  AudiusLogo
} from '@/components/ui/Icon';

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="container-wide py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6">
          {/* Brand column */}
          <div className="md:col-span-4">
            <div className="mb-8">
              <AudiusLogo className="h-7 text-text-primary hover:text-audius-purple transition-colors" />
            </div>
            
            {/* Social links */}
            <div>
              <h3 className="text-fluid-small font-bold uppercase tracking-widest text-text-primary mb-6">
                Follow Us
              </h3>
              <div className="flex gap-8 py-2">
                <a 
                  href={EXTERNAL_URLS.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Instagram"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <InstagramIcon className="w-7 h-7" />
                </a>
                <a 
                  href={EXTERNAL_URLS.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Twitter"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <TwitterIcon className="w-7 h-7" />
                </a>
                <a 
                  href={EXTERNAL_URLS.discord} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Discord"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <DiscordIcon className="w-7 h-7" />
                </a>
                <a 
                  href={EXTERNAL_URLS.telegram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Telegram"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <TelegramIcon className="w-7 h-7" />
                </a>
                <a 
                  href="https://tiktok.com/@audius" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="TikTok"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <TikTokIcon className="w-7 h-7" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Audius column */}
          <div className="md:col-span-2 md:col-start-6">
            <ul className="space-y-2.5">
              <li>
                <a 
                  href={EXTERNAL_URLS.audiusMusic} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-base text-text-secondary hover:text-text-primary transition-colors"
                >
                  Audius Music
                </a>
              </li>
              <li>
                <a 
                  href={EXTERNAL_URLS.download} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-base text-text-secondary hover:text-text-primary transition-colors"
                >
                  Download
                </a>
              </li>
              <li>
                <a 
                  href={EXTERNAL_URLS.helpCenter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-base text-text-secondary hover:text-text-primary transition-colors"
                >
                  Help Center
                </a>
              </li>
            </ul>
          </div>
          
          {/* Resources column */}
          <div className="md:col-span-2">
            <ul className="space-y-2.5">
              <li>
                <a 
                  href={EXTERNAL_URLS.blog} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-base text-text-secondary hover:text-text-primary transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a 
                  href={EXTERNAL_URLS.events} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-base text-text-secondary hover:text-text-primary transition-colors"
                >
                  Events
                </a>
              </li>
              <li>
                <a 
                  href={EXTERNAL_URLS.merchStore} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-base text-text-secondary hover:text-text-primary transition-colors"
                >
                  Merch Store
                </a>
              </li>
            </ul>
          </div>
          
          {/* Company column */}
          <div className="md:col-span-2">
            <ul className="space-y-2.5">
              <li>
                <a 
                  href={EXTERNAL_URLS.brandPress} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-base text-text-secondary hover:text-text-primary transition-colors"
                >
                  Brand / Press
                </a>
              </li>
              <li>
                <a 
                  href={EXTERNAL_URLS.engineering} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-base text-text-secondary hover:text-text-primary transition-colors"
                >
                  Engineering
                </a>
              </li>
              <li>
                <a 
                  href={EXTERNAL_URLS.openAudioFoundation} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-base text-text-secondary hover:text-text-primary transition-colors"
                >
                  Open Audio Foundation
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom row */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-subtle">
            © {new Date().getFullYear()} Audius Music. All rights reserved.
          </p>
          <div className="flex gap-16 text-sm">
            <a 
              href={EXTERNAL_URLS.termsOfService} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-text-subtle hover:text-text-primary transition-colors"
            >
              Terms of Service
            </a>
            <a 
              href={EXTERNAL_URLS.privacyPolicy} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-text-subtle hover:text-text-primary transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
