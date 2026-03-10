// components/layout/CompareDropdown.tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Dropdown, type DropdownSection } from '@/components/ui/Dropdown';
import { DEFAULT_COMPETITOR } from '@/lib/constants';
import type { Platform } from '@/types';

interface CompareDropdownProps {
  competitors: Platform[];
}

export function CompareDropdown({ competitors }: CompareDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine current competitor from pathname
  const currentSlug = pathname === '/' ? DEFAULT_COMPETITOR : pathname.slice(1);

  const sections: DropdownSection[] = [
    {
      items: competitors.map(competitor => ({
        id: competitor.slug,
        label: competitor.name,
        description: `Audius versus ${competitor.name}, side-by-side feature comparison.`,
        onClick: () => router.push(`/${competitor.slug}`),
        isActive: competitor.slug === currentSlug,
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
