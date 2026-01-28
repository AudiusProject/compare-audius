// app/admin/features/[id]/page.tsx

import { notFound } from 'next/navigation';
import { getFeatureById } from '@/lib/data';
import { FeatureForm } from '@/components/admin/FeatureForm';

export default async function EditFeaturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const feature = await getFeatureById(id);
  
  if (!feature) {
    notFound();
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Feature</h1>
      <FeatureForm feature={feature} />
    </div>
  );
}
