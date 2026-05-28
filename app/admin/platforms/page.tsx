// app/admin/platforms/page.tsx

import { getAllPlatforms } from '@/lib/data';
import Link from 'next/link';
import { PlatformList } from '@/components/admin/PlatformList';

export default async function PlatformsPage() {
  const platforms = await getAllPlatforms();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Platforms</h1>
        <Link
          href="/admin/platforms/new"
          className="px-4 py-2 bg-audius-purple text-text-primary text-sm font-medium rounded-lg hover:bg-audius-purple-dark transition-colors whitespace-nowrap"
        >
          Add Platform
        </Link>
      </div>

      <PlatformList platforms={platforms} />
    </div>
  );
}
