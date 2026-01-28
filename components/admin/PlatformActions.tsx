'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DeleteConfirm } from './DeleteConfirm';
import { useToast } from './Toast';
import type { Platform } from '@/db/schema';

interface PlatformActionsProps {
  platform: Platform;
}

export function PlatformActions({ platform }: PlatformActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  
  const handlePublishToggle = async () => {
    try {
      const res = await fetch(`/api/platforms/${platform.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDraft: !platform.isDraft }),
      });
      
      if (!res.ok) throw new Error('Failed to update');
      
      showToast(
        platform.isDraft ? 'Platform published' : 'Platform unpublished',
        'success'
      );
      router.refresh();
    } catch {
      showToast('Failed to update platform', 'error');
    }
  };
  
  const handleDelete = async () => {
    const res = await fetch(`/api/platforms/${platform.id}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) {
      const data = await res.json();
      showToast(data.error || 'Failed to delete', 'error');
      throw new Error(data.error || 'Failed to delete');
    }
    
    showToast('Platform deleted', 'success');
    router.refresh();
  };
  
  return (
    <div className="flex items-center gap-2 justify-end">
      {!platform.isAudius && (
        <button
          onClick={handlePublishToggle}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          {platform.isDraft ? 'Publish' : 'Unpublish'}
        </button>
      )}
      
      <Link
        href={`/admin/platforms/${platform.id}`}
        className="text-sm text-audius-purple hover:underline"
      >
        Edit
      </Link>
      
      {!platform.isAudius && (
        <DeleteConfirm
          title="Delete Platform"
          message={`Are you sure you want to delete "${platform.name}"? This will also delete all comparisons for this platform.`}
          onConfirm={handleDelete}
          trigger={
            <button className="text-sm text-red-600 hover:underline">
              Delete
            </button>
          }
        />
      )}
    </div>
  );
}
