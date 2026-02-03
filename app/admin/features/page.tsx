// app/admin/features/page.tsx

import { getAllFeatures, getAllComparisons, getAllPlatforms } from '@/lib/data';
import Link from 'next/link';
import { FeatureList } from '@/components/admin/FeatureList';

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
        <div>
          <h1 className="text-2xl font-bold">Features</h1>
          <p className="text-sm text-text-secondary mt-1">Drag to reorder</p>
        </div>
        <Link
          href="/admin/features/new"
          className="px-4 py-2 bg-audius-purple text-text-primary rounded-lg hover:bg-audius-purple-dark transition-colors"
        >
          Add Feature
        </Link>
      </div>
      
      <FeatureList features={features} completeness={completeness} />
    </div>
  );
}
