// components/layout/CompareDropdown.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Dropdown, type DropdownSection } from '@/components/ui/Dropdown';
import { getCompetitors } from '@/lib/data';

export function CompareDropdown() {
  const router = useRouter();
  const competitors = getCompetitors();
  
  const sections: DropdownSection[] = [
    {
      items: competitors.map(competitor => ({
        id: competitor.slug,
        label: `Audius vs. ${competitor.name}`,
        onClick: () => router.push(`/${competitor.slug}`),
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
