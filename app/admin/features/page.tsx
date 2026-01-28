// app/admin/features/page.tsx

import { getAllFeatures, getAllComparisons, getAllPlatforms } from '@/lib/data';
import Link from 'next/link';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FeatureActions } from '@/components/admin/FeatureActions';

export default async function FeaturesPage() {
  const features = await getAllFeatures();
  const comparisons = await getAllComparisons();
  const platforms = await getAllPlatforms();
  
  const publishedPlatformCount = platforms.filter(p => !p.isDraft).length;
  
  // Calculate comparison completeness per feature
  const completeness = features.map(feature => {
    const featureComparisons = comparisons.filter(c => c.featureId === feature.id);
    return {
      featureId: feature.id,
      count: featureComparisons.length,
      total: publishedPlatformCount,
      complete: featureComparisons.length >= publishedPlatformCount,
    };
  });
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Features</h1>
        <Link
          href="/admin/features/new"
          className="px-4 py-2 bg-audius-purple text-white rounded-lg hover:bg-audius-purple-dark transition-colors"
        >
          Add Feature
        </Link>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Order</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Description</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Comparisons</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {features.map((feature) => {
              const comp = completeness.find(c => c.featureId === feature.id)!;
              return (
                <tr key={feature.id} className={feature.isDraft ? 'bg-yellow-50/50' : ''}>
                  <td className="px-4 py-3 text-gray-500">{feature.sortOrder}</td>
                  <td className="px-4 py-3 font-medium">{feature.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm max-w-xs truncate">
                    {feature.description}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge isDraft={feature.isDraft} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={comp.complete ? 'text-green-600' : 'text-yellow-600'}>
                      {comp.count}/{comp.total}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <FeatureActions feature={feature} canPublish={comp.complete} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
