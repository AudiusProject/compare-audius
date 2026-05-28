// components/admin/PlatformList.tsx
//
// Card layout below lg, table layout at lg+. Actions are always visible at
// the bottom of each card / right of each row — never clipped off-screen.

import Image from 'next/image';
import type { Platform } from '@/db/schema';
import { StatusBadge } from './StatusBadge';
import { PlatformActions } from './PlatformActions';
import { cn } from '@/lib/utils';

interface PlatformListProps {
  platforms: Platform[];
}

export function PlatformList({ platforms }: PlatformListProps) {
  return (
    <div className="bg-surface-alt rounded-lg border border-border overflow-hidden">
      {/* ---------- Card layout (default) ---------- */}
      <ul className="lg:hidden divide-y divide-border">
        {platforms.map((platform) => (
          <li
            key={platform.id}
            className={cn('flex items-start gap-3 p-4', platform.isDraft && 'bg-tint-05')}
          >
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
              <Image
                src={platform.logo}
                alt={platform.name}
                width={40}
                height={40}
                className="object-contain logo-white"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-text-primary truncate">
                    {platform.name}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5 font-mono truncate">
                    {platform.slug}
                  </div>
                </div>
                <StatusBadge isDraft={platform.isDraft} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                <span
                  className={cn(
                    'text-xs',
                    platform.isAudius ? 'text-audius-purple font-medium' : 'text-text-muted',
                  )}
                >
                  {platform.isAudius ? 'Audius' : 'Competitor'}
                </span>
                <PlatformActions platform={platform} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* ---------- Table layout (lg+) ---------- */}
      <table className="hidden lg:table w-full">
        <thead className="bg-surface border-b border-border">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide">
              Logo
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide">
              Slug
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide">
              Type
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {platforms.map((platform) => (
            <tr key={platform.id} className={platform.isDraft ? 'bg-tint-05' : ''}>
              <td className="px-4 py-3">
                <Image
                  src={platform.logo}
                  alt={platform.name}
                  width={40}
                  height={40}
                  className="object-contain logo-white"
                />
              </td>
              <td className="px-4 py-3 font-medium">{platform.name}</td>
              <td className="px-4 py-3 text-text-muted text-sm font-mono">{platform.slug}</td>
              <td className="px-4 py-3">
                <StatusBadge isDraft={platform.isDraft} />
              </td>
              <td className="px-4 py-3">
                {platform.isAudius ? (
                  <span className="text-audius-purple font-medium text-sm">Audius</span>
                ) : (
                  <span className="text-text-muted text-sm">Competitor</span>
                )}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <PlatformActions platform={platform} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
