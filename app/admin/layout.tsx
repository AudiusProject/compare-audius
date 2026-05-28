// app/admin/layout.tsx

import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/admin/AdminNav';
import { ToastProvider } from '@/components/admin/Toast';
import { UserSection } from '@/components/admin/UserSection';
import { MobileAdminNav } from '@/components/admin/MobileAdminNav';
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

  const userData = {
    name: session.user?.name ?? null,
    email: session.user?.email ?? null,
    image: session.user?.image ?? null,
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-surface text-text-primary">
        {/* Mobile-only top bar + drawer. Renders the same nav + user section
            on small viewports. */}
        <MobileAdminNav>
          <div className="flex-1 overflow-y-auto">
            <AdminNav />
          </div>
          <UserSection user={userData} />
        </MobileAdminNav>

        {/* Desktop sidebar — visible at md+. */}
        <aside className="hidden md:flex fixed top-0 left-0 w-64 h-screen bg-surface-alt border-r border-border flex-col">
          <div className="p-4 border-b border-border">
            <span className="text-xl font-bold text-audius-purple">Compare Admin</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <AdminNav />
          </div>
          <UserSection user={userData} />
        </aside>

        {/* Main content — offset by the sidebar on md+, with top padding
            on narrow viewports to clear the fixed mobile top bar. */}
        <main className="md:ml-64 min-h-screen pt-14 md:pt-0">
          {authBypassed && (
            <div className="bg-status-warn/15 border-b border-status-warn/40 text-status-warn px-4 md:px-8 py-2 text-xs font-medium">
              DEV_SKIP_AUTH is on — authentication is bypassed. Do not run this build in
              production.
            </div>
          )}
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
