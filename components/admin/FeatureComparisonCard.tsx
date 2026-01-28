'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { StatusSelect } from './StatusSelect';
import { StatusBadge } from './StatusBadge';
import { useToast } from './Toast';
import { cn } from '@/lib/utils';
import type { Feature, Platform, Comparison } from '@/db/schema';

interface ComparisonData {
  platformId: string;
  status: 'yes' | 'no' | 'partial' | 'custom';
  displayValue: string | null;
  context: string | null;
}

interface FeatureComparisonCardProps {
  feature: Feature;
  platforms: Platform[];
  comparisons: Comparison[];
}

export function FeatureComparisonCard({
  feature,
  platforms,
  comparisons,
}: FeatureComparisonCardProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Initialize state from existing comparisons
  const [data, setData] = useState<Record<string, ComparisonData>>(() => {
    const initial: Record<string, ComparisonData> = {};
    platforms.forEach(platform => {
      const existing = comparisons.find(c => c.platformId === platform.id);
      initial[platform.id] = {
        platformId: platform.id,
        status: (existing?.status as ComparisonData['status']) ?? 'no',
        displayValue: existing?.displayValue ?? null,
        context: existing?.context ?? null,
      };
    });
    return initial;
  });
  
  const updateComparison = (platformId: string, updates: Partial<ComparisonData>) => {
    setData(prev => ({
      ...prev,
      [platformId]: { ...prev[platformId], ...updates },
    }));
  };
  
  const handleSave = async () => {
    setSaving(true);
    try {
      const items = Object.values(data).map(d => ({
        platformId: d.platformId,
        featureId: feature.id,
        status: d.status,
        displayValue: d.status === 'custom' ? d.displayValue : null,
        context: d.status === 'partial' ? d.context : null,
      }));
      
      const res = await fetch('/api/comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      
      if (!res.ok) throw new Error('Failed to save');
      
      showToast('Comparisons saved', 'success');
      router.refresh();
    } catch {
      showToast('Failed to save comparisons', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg
            className={cn('w-5 h-5 text-gray-400 transition-transform', isExpanded && 'rotate-90')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="text-left">
            <h3 className="font-medium">{feature.name}</h3>
            <p className="text-sm text-gray-500">{feature.description}</p>
          </div>
        </div>
        <StatusBadge isDraft={feature.isDraft} />
      </button>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <div className="space-y-4 mt-4">
            {platforms.map(platform => {
              const comp = data[platform.id];
              return (
                <div key={platform.id} className="flex items-start gap-4">
                  {/* Platform logo + name */}
                  <div className="w-32 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Image
                        src={platform.logo}
                        alt={platform.name}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                      <span className="text-sm font-medium">
                        {platform.name}
                        {platform.isDraft && <span className="text-yellow-600 ml-1">(Draft)</span>}
                      </span>
                    </div>
                  </div>
                  
                  {/* Status select */}
                  <StatusSelect
                    value={comp.status}
                    onChange={(status) => updateComparison(platform.id, { status })}
                  />
                  
                  {/* Context field for partial */}
                  {comp.status === 'partial' && (
                    <input
                      type="text"
                      value={comp.context ?? ''}
                      onChange={(e) => updateComparison(platform.id, { context: e.target.value })}
                      placeholder="Context (e.g., Premium Subscription Required)"
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                  )}
                  
                  {/* Display value for custom */}
                  {comp.status === 'custom' && (
                    <input
                      type="text"
                      value={comp.displayValue ?? ''}
                      onChange={(e) => updateComparison(platform.id, { displayValue: e.target.value })}
                      placeholder="Value (e.g., 320 kbps)"
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Save button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-audius-purple text-white text-sm rounded-lg hover:bg-audius-purple-dark disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
