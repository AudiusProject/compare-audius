// app/admin/page.tsx

import { auth } from '@/auth';
import { getAllPlatforms, getAllFeatures, getAllComparisons } from '@/lib/data';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await auth();
  const platforms = await getAllPlatforms();
  const features = await getAllFeatures();
  const comparisons = await getAllComparisons();
  
  const publishedPlatforms = platforms.filter(p => !p.isDraft).length;
  const draftPlatforms = platforms.filter(p => p.isDraft).length;
  const publishedFeatures = features.filter(f => !f.isDraft).length;
  const draftFeatures = features.filter(f => f.isDraft).length;
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-text-secondary mb-8">Welcome back, {session?.user?.name}</p>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Platforms"
          total={platforms.length}
          published={publishedPlatforms}
          draft={draftPlatforms}
          href="/admin/platforms"
        />
        <StatsCard
          title="Features"
          total={features.length}
          published={publishedFeatures}
          draft={draftFeatures}
          href="/admin/features"
        />
        <StatsCard
          title="Comparisons"
          total={comparisons.length}
          href="/admin/comparisons"
        />
      </div>
      
      {/* Quick actions */}
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="flex gap-4 mb-8">
        <Link
          href="/admin/platforms/new"
          className="px-4 py-2 bg-audius-purple text-text-primary rounded-lg hover:bg-audius-purple-dark transition-colors"
        >
          Add Platform
        </Link>
        <Link
          href="/admin/features/new"
          className="px-4 py-2 bg-audius-purple text-text-primary rounded-lg hover:bg-audius-purple-dark transition-colors"
        >
          Add Feature
        </Link>
        <Link
          href="/admin/comparisons"
          className="px-4 py-2 border border-border rounded-lg hover:bg-tint-05 transition-colors"
        >
          Edit Comparisons
        </Link>
      </div>
      
      {/* Public Site Links */}
      <div className="p-4 bg-surface-alt rounded-lg border border-border">
        <h3 className="font-medium text-text-primary">Public Site Links</h3>
        <div className="mt-2 flex gap-4 text-sm">
          <Link href="/" className="text-audius-purple hover:underline" target="_blank">
            Home (/)
          </Link>
          <Link href="/soundcloud" className="text-audius-purple hover:underline" target="_blank">
            SoundCloud
          </Link>
          <Link href="/spotify" className="text-audius-purple hover:underline" target="_blank">
            Spotify
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ 
  title, 
  total, 
  published, 
  draft, 
  href 
}: { 
  title: string; 
  total: number; 
  published?: number;
  draft?: number;
  href: string;
}) {
  return (
    <Link href={href} className="block bg-surface-alt rounded-lg border border-border p-6 hover:border-audius-purple transition-colors">
      <h3 className="text-sm font-medium text-text-muted mb-1">{title}</h3>
      <p className="text-3xl font-bold mb-2">{total}</p>
      {published !== undefined && draft !== undefined && (
        <div className="flex gap-4 text-sm">
          <span className="text-status-yes">{published} published</span>
          <span className="text-status-warn">{draft} draft</span>
        </div>
      )}
    </Link>
  );
}
