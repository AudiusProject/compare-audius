// app/admin/features/new/page.tsx

import { getAllFeatures } from '@/lib/data';
import { FeatureForm } from '@/components/admin/FeatureForm';

export default async function NewFeaturePage() {
  const features = await getAllFeatures();
  const maxSortOrder = Math.max(0, ...features.map(f => f.sortOrder));
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add Feature</h1>
      <FeatureForm nextSortOrder={maxSortOrder + 1} />
    </div>
  );
}
