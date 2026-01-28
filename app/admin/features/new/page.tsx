// app/admin/features/new/page.tsx

import { FeatureForm } from '@/components/admin/FeatureForm';

export default function NewFeaturePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add Feature</h1>
      <FeatureForm />
    </div>
  );
}
