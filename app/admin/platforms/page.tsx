// app/admin/platforms/page.tsx

import { getAllPlatforms } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PlatformActions } from '@/components/admin/PlatformActions';

export default async function PlatformsPage() {
  const platforms = await getAllPlatforms();
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Platforms</h1>
        <Link
          href="/admin/platforms/new"
          className="px-4 py-2 bg-audius-purple text-white rounded-lg hover:bg-audius-purple-dark transition-colors"
        >
          Add Platform
        </Link>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Logo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Slug</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Type</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {platforms.map((platform) => (
              <tr key={platform.id} className={platform.isDraft ? 'bg-yellow-50/50' : ''}>
                <td className="px-4 py-3">
                  <Image
                    src={platform.logo}
                    alt={platform.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </td>
                <td className="px-4 py-3 font-medium">{platform.name}</td>
                <td className="px-4 py-3 text-gray-500 text-sm">{platform.slug}</td>
                <td className="px-4 py-3">
                  <StatusBadge isDraft={platform.isDraft} />
                </td>
                <td className="px-4 py-3">
                  {platform.isAudius ? (
                    <span className="text-audius-purple font-medium text-sm">Audius</span>
                  ) : (
                    <span className="text-gray-500 text-sm">Competitor</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <PlatformActions platform={platform} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
