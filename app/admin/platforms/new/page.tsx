// app/admin/platforms/new/page.tsx

import { PlatformForm } from '@/components/admin/PlatformForm';

export default function NewPlatformPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add Platform</h1>
      <PlatformForm />
    </div>
  );
}
