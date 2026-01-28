'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useToast } from './Toast';
import type { Platform } from '@/db/schema';

interface PlatformFormProps {
  platform?: Platform;
}

export function PlatformForm({ platform }: PlatformFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEditing = !!platform;
  
  const [name, setName] = useState(platform?.name ?? '');
  const [slug, setSlug] = useState(platform?.slug ?? '');
  const [logo, setLogo] = useState(platform?.logo ?? '');
  const [saving, setSaving] = useState(false);
  const [logoError, setLogoError] = useState(false);
  
  // Auto-generate slug from name
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
        logo,
        ...(publish ? { isDraft: false } : {}),
      };
      
      const url = isEditing ? `/api/platforms/${platform.id}` : '/api/platforms';
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
      
      showToast(isEditing ? 'Platform updated' : 'Platform created', 'success');
      router.push('/admin/platforms');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save platform';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            maxLength={50}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-audius-purple focus:border-transparent"
          />
        </div>
        
        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            pattern="[a-z0-9-]+"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-audius-purple focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            URL-safe identifier (lowercase, hyphens only)
          </p>
        </div>
        
        {/* Logo URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Logo URL
          </label>
          <input
            type="url"
            value={logo}
            onChange={(e) => {
              setLogo(e.target.value);
              setLogoError(false);
            }}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-audius-purple focus:border-transparent"
          />
          {logo && !logoError && (
            <div className="mt-2 p-4 bg-gray-100 rounded-lg inline-block">
              <Image
                src={logo}
                alt="Logo preview"
                width={120}
                height={40}
                className="object-contain"
                onError={() => setLogoError(true)}
              />
            </div>
          )}
          {logoError && (
            <p className="mt-2 text-sm text-red-600">Failed to load logo preview</p>
          )}
        </div>
      </div>
      
      {/* Actions */}
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
