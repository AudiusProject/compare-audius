// app/admin/data/page.tsx

import { DataIO } from '@/components/admin/DataIO';

export default function AdminDataPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Data</h1>
      <p className="text-text-secondary mb-8">
        Export the full dataset as JSON, edit it, and re-upload to apply changes.
        Identical rows are skipped, new or changed rows go through a review step,
        and rows missing from the upload are left untouched.
      </p>
      <DataIO />
    </div>
  );
}
