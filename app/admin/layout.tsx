// app/admin/layout.tsx

import { signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/admin/AdminNav';
import { ToastProvider } from '@/components/admin/Toast';
import Image from 'next/image';
import { getRequestOrigin } from '@/lib/origin';
import { getEffectiveSession } from '@/lib/api-helpers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getEffectiveSession();

  if (!session) {
    redirect('/login');
  }

  const authBypassed =
    process.env.NODE_ENV !== 'production' && process.env.DEV_SKIP_AUTH === 'true';
  
  return (
    <ToastProvider>
      <div className="min-h-screen bg-surface text-text-primary">
        {/* Sidebar - Fixed */}
        <aside className="fixed top-0 left-0 w-64 h-screen bg-surface-alt border-r border-border flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-border">
            <span className="text-xl font-bold text-audius-purple">Compare Admin</span>
          </div>
          
          {/* Navigation */}
          <AdminNav />
          
          {/* User section */}
          <div className="mt-auto p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt=""
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{session.user?.name}</p>
                <p className="text-xs text-text-muted truncate">{session.user?.email}</p>
              </div>
            </div>
            <form
              action={async () => {
                'use server';
                const origin = await getRequestOrigin();
                const redirectTo = origin ? `${origin}/login` : '/login';
                await signOut({ redirectTo });
              }}
            >
              <button
                type="submit"
                className="w-full text-sm text-text-secondary hover:text-text-primary text-left"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>
        
        {/* Main content - offset by sidebar width */}
        <main className="ml-64 min-h-screen">
          {authBypassed && (
            <div className="bg-status-warn/15 border-b border-status-warn/40 text-status-warn px-8 py-2 text-xs font-medium">
              DEV_SKIP_AUTH is on — authentication is bypassed. Do not run this build in production.
            </div>
          )}
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
