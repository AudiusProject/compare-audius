// components/layout/MoreDropdown.tsx
'use client';

import { Dropdown, type DropdownSection } from '@/components/ui/Dropdown';
import { EXTERNAL_URLS } from '@/lib/constants';
import {
  InstagramIcon,
  TwitterIcon,
  DiscordIcon,
  TikTokIcon
} from '@/components/ui/Icon';

export function MoreDropdown() {
  const sections: DropdownSection[] = [
    {
      items: [
        {
          id: 'blog',
          label: 'Blog',
          description: 'Official updates, releases, and news from the Audius team.',
          href: EXTERNAL_URLS.blog,
        },
      ],
    },
    {
      items: [
        {
          id: 'help-support',
          label: 'Help & Support',
          description: 'Get answers and find resources',
          href: EXTERNAL_URLS.helpCenter,
        },
      ],
    },
  ];

  const socialFooter = (
    <div className="flex items-center justify-center gap-5">
      <a
        href={EXTERNAL_URLS.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral-400 hover:text-white active:text-white focus-visible:outline-none focus-visible:text-white transition-colors"
        aria-label="Instagram"
      >
        <InstagramIcon className="w-5 h-5" />
      </a>
      <a
        href={EXTERNAL_URLS.discord}
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral-400 hover:text-white active:text-white focus-visible:outline-none focus-visible:text-white transition-colors"
        aria-label="Discord"
      >
        <DiscordIcon className="w-5 h-5" />
      </a>
      <a
        href="https://www.tiktok.com/@audius"
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral-400 hover:text-white active:text-white focus-visible:outline-none focus-visible:text-white transition-colors"
        aria-label="TikTok"
      >
        <TikTokIcon className="w-5 h-5" />
      </a>
      <a
        href={EXTERNAL_URLS.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral-400 hover:text-white active:text-white focus-visible:outline-none focus-visible:text-white transition-colors"
        aria-label="X (Twitter)"
      >
        <TwitterIcon className="w-5 h-5" />
      </a>
    </div>
  );

  return (
    <Dropdown
      trigger={<span>Explore</span>}
      sections={sections}
      align="left"
      dropdownClassName="min-w-[320px]"
      footer={socialFooter}
    />
  );
}
