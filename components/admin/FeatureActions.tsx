'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DeleteConfirm } from './DeleteConfirm';
import { useToast } from './Toast';
import type { Feature } from '@/db/schema';

interface FeatureActionsProps {
  feature: Feature;
  canPublish: boolean;
}

export function FeatureActions({ feature, canPublish }: FeatureActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  
  const handlePublishToggle = async () => {
    if (feature.isDraft && !canPublish) {
      showToast('Complete all comparisons before publishing', 'error');
      return;
    }
    
    try {
      const res = await fetch(`/api/features/${feature.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDraft: !feature.isDraft }),
      });
      
      if (!res.ok) throw new Error('Failed to update');
      
      showToast(
        feature.isDraft ? 'Feature published' : 'Feature unpublished',
        'success'
      );
      router.refresh();
    } catch {
      showToast('Failed to update feature', 'error');
    }
  };
  
  const handleDelete = async () => {
    const res = await fetch(`/api/features/${feature.id}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) {
      const data = await res.json();
      showToast(data.error || 'Failed to delete', 'error');
      throw new Error(data.error || 'Failed to delete');
    }
    
    showToast('Feature deleted', 'success');
    router.refresh();
  };
  
  return (
    <div className="flex items-center gap-2 justify-end">
      <button
        onClick={handlePublishToggle}
        disabled={feature.isDraft && !canPublish}
        className="text-sm text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
        title={feature.isDraft && !canPublish ? 'Complete all comparisons first' : undefined}
      >
        {feature.isDraft ? 'Publish' : 'Unpublish'}
      </button>
      
      <Link
        href={`/admin/features/${feature.id}`}
        className="text-sm text-audius-purple hover:underline"
      >
        Edit
      </Link>
      
      <DeleteConfirm
        title="Delete Feature"
        message={`Are you sure you want to delete "${feature.name}"? This will also delete all comparisons for this feature.`}
        onConfirm={handleDelete}
        trigger={
          <button className="text-sm text-status-no hover:underline">
            Delete
          </button>
        }
      />
    </div>
  );
}
