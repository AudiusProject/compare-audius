// components/layout/CompareDropdown.tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Dropdown, type DropdownSection } from '@/components/ui/Dropdown';
import { getCompetitors } from '@/lib/data';
import { DEFAULT_COMPETITOR } from '@/lib/constants';

export function CompareDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const competitors = getCompetitors();
  
  // Determine current competitor from pathname
  const currentSlug = pathname === '/' ? DEFAULT_COMPETITOR : pathname.slice(1);
  
  const sections: DropdownSection[] = [
    {
      items: competitors.map(competitor => ({
        id: competitor.slug,
        label: `Audius vs. ${competitor.name}`,
        onClick: () => router.push(`/${competitor.slug}`),
        isActive: competitor.slug === currentSlug,
      })),
    },
  ];
  
  return (
    <Dropdown
      trigger={<span>Compare</span>}
      sections={sections}
      align="left"
    />
  );
}
