// components/layout/MoreDropdown.tsx
'use client';

import { Dropdown, type DropdownSection } from '@/components/ui/Dropdown';
import { EXTERNAL_URLS } from '@/lib/constants';
import { 
  InstagramIcon, 
  TwitterIcon, 
  DiscordIcon, 
  TelegramIcon,
  TikTokIcon 
} from '@/components/ui/Icon';

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
      trigger={<span>More</span>}
      sections={sections}
      align="left"
    />
  );
}
