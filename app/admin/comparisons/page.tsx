// app/admin/comparisons/page.tsx

import { getAllFeatures, getAllPlatforms, getAllComparisons } from '@/lib/data';
import { FeatureComparisonCard } from '@/components/admin/FeatureComparisonCard';

export default async function ComparisonsPage() {
  const features = await getAllFeatures();
  const platforms = await getAllPlatforms();
  const comparisons = await getAllComparisons();
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Comparisons</h1>
        <p className="text-text-secondary mt-1">
          Edit how each platform compares on each feature
        </p>
      </div>
      
      <div className="space-y-4">
        {features.map(feature => (
          <FeatureComparisonCard
            key={feature.id}
            feature={feature}
            platforms={platforms}
            comparisons={comparisons.filter(c => c.featureId === feature.id)}
          />
        ))}
      </div>
    </div>
  );
}
