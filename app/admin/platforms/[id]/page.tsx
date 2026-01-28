// app/admin/platforms/[id]/page.tsx

import { notFound } from 'next/navigation';
import { getPlatformById } from '@/lib/data';
import { PlatformForm } from '@/components/admin/PlatformForm';

export default async function EditPlatformPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const platform = await getPlatformById(id);
  
  if (!platform) {
    notFound();
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Platform</h1>
      <PlatformForm platform={platform} />
    </div>
  );
}
