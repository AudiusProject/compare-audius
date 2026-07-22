// components/layout/CompareDropdown.tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Dropdown, type DropdownSection } from '@/components/ui/Dropdown';
import { DEFAULT_COMPETITOR } from '@/lib/constants';
import { parseCompareSegment } from '@/lib/compare';
import type { Platform } from '@/types';

interface CompareDropdownProps {
  competitors: Platform[];
}

export function CompareDropdown({ competitors }: CompareDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Slugs in the current comparison ("/" shows the default competitor;
  // multi-segment paths like /spotify-vs-soundcloud contain several)
  const currentSlugs = pathname === '/'
    ? [DEFAULT_COMPETITOR]
    : parseCompareSegment(pathname.slice(1));

  const sections: DropdownSection[] = [
    {
      items: competitors.map(competitor => ({
        id: competitor.slug,
        label: competitor.name,
        description: `Audius versus ${competitor.name}, side-by-side feature comparison.`,
        onClick: () => router.push(`/${competitor.slug}`),
        isActive: currentSlugs.includes(competitor.slug),
      })),
    },
  ];

  return (
    <Dropdown
      trigger={<span>Compare</span>}
      sections={sections}
      align="right"
      dropdownClassName="min-w-[360px]"
    />
  );
}
