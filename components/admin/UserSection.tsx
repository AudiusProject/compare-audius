// components/admin/UserSection.tsx
//
// Server component shared between the desktop sidebar and the mobile drawer.

import Image from 'next/image';
import { signOutAction } from '@/lib/admin-actions';

interface UserSectionProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserSection({ user }: UserSectionProps) {
  return (
    <div className="p-4 border-t border-border">
      <div className="flex items-center gap-3 mb-3">
        {user.image && (
          <Image
            src={user.image}
            alt=""
            width={32}
            height={32}
            className="rounded-full flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
          <p className="text-xs text-text-muted truncate">{user.email}</p>
        </div>
      </div>
      <form action={signOutAction}>
        <button
          type="submit"
          className="w-full text-sm text-text-secondary hover:text-text-primary text-left"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
