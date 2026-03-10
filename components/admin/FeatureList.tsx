'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StatusBadge } from './StatusBadge';
import { FeatureActions } from './FeatureActions';
import { useToast } from './Toast';
import { cn } from '@/lib/utils';
import type { Feature } from '@/db/schema';

interface FeatureListProps {
  features: Feature[];
  completeness: { featureId: string; count: number; total: number; complete: boolean }[];
}

export function FeatureList({ features: initialFeatures, completeness }: FeatureListProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [features, setFeatures] = useState(initialFeatures);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Add drag image styling
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder the list
    const newFeatures = [...features];
    const [draggedItem] = newFeatures.splice(draggedIndex, 1);
    newFeatures.splice(dropIndex, 0, draggedItem);

    setFeatures(newFeatures);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Save new order to server
    await saveOrder(newFeatures);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const saveOrder = async (orderedFeatures: Feature[]) => {
    setSaving(true);
    try {
      const order = orderedFeatures.map((f, index) => ({
        id: f.id,
        sortOrder: index + 1,
      }));

      const res = await fetch('/api/features/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });

      if (!res.ok) throw new Error('Failed to save order');

      showToast('Order saved', 'success');
      router.refresh();
    } catch {
      showToast('Failed to save order', 'error');
      // Revert to original order
      setFeatures(initialFeatures);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface-alt rounded-lg border border-border overflow-hidden">
      {saving && (
        <div className="px-4 py-2 bg-audius-purple/10 text-audius-purple text-sm">
          Saving order...
        </div>
      )}
      <table className="w-full">
        <thead className="bg-surface border-b border-border">
          <tr>
            <th className="w-10 px-2 py-3"></th>
            <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">Name</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">Description</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">Comparisons</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-text-muted">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {features.map((feature, index) => {
            const comp = completeness.find(c => c.featureId === feature.id)!;
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
              <tr
                key={feature.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'transition-colors',
                  feature.isDraft ? 'bg-tint-05' : '',
                  isDragging && 'opacity-50',
                  isDragOver && 'bg-audius-purple/10'
                )}
              >
                <td className="px-2 py-3 cursor-grab active:cursor-grabbing">
                  <DragHandle />
                </td>
                <td className="px-4 py-3 font-medium">{feature.name}</td>
                <td className="px-4 py-3 text-text-muted text-sm max-w-xs truncate">
                  {feature.description}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge isDraft={feature.isDraft} />
                </td>
                <td className="px-4 py-3">
                  <span className={comp.complete ? 'text-status-yes' : 'text-status-warn'}>
                    {comp.count}/{comp.total}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <FeatureActions feature={feature} canPublish={comp.complete} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DragHandle() {
  return (
    <svg className="w-5 h-5 text-text-muted" fill="currentColor" viewBox="0 0 20 20">
      <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
    </svg>
  );
}
