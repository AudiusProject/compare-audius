'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './Toast';
import type { Feature } from '@/db/schema';

interface FeatureFormProps {
  feature?: Feature;
  nextSortOrder?: number;
}

export function FeatureForm({ feature, nextSortOrder = 1 }: FeatureFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEditing = !!feature;
  
  const [name, setName] = useState(feature?.name ?? '');
  const [slug, setSlug] = useState(feature?.slug ?? '');
  const [description, setDescription] = useState(feature?.description ?? '');
  const [sortOrder, setSortOrder] = useState(feature?.sortOrder ?? nextSortOrder);
  const [saving, setSaving] = useState(false);
  
  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEditing) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const body = {
        name,
        slug,
        description,
        sortOrder,
        ...(publish ? { isDraft: false } : {}),
      };
      
      const url = isEditing ? `/api/features/${feature.id}` : '/api/features';
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
      
      showToast(isEditing ? 'Feature updated' : 'Feature created', 'success');
      router.push('/admin/features');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save feature';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            maxLength={100}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-audius-purple focus:border-transparent"
          />
        </div>
        
<div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            maxLength={500}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-audius-purple focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
            required
            min={1}
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-audius-purple focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save as Draft'}
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          disabled={saving}
          className="px-4 py-2 bg-audius-purple text-white rounded-lg hover:bg-audius-purple-dark disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save & Publish'}
        </button>
      </div>
    </form>
  );
}
