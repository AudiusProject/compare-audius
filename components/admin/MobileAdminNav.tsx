'use client';

// components/admin/MobileAdminNav.tsx
//
// Top bar + slide-in drawer, visible only below the md breakpoint. Accepts
// the nav and user-section as `children` so the server-rendered subtrees
// (which need `auth()`) get composed without crossing the RSC boundary.

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface MobileAdminNavProps {
  children: React.ReactNode;
}

export function MobileAdminNav({ children }: MobileAdminNavProps) {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {/* Top bar — fixed, only on narrow viewports. The main content adds
          pt-14 below md to clear it. */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 h-14 bg-surface-alt border-b border-border flex items-center px-4 gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="-ml-2 p-2 rounded-lg hover:bg-tint-05 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <span className="text-base font-bold text-audius-purple">Compare Admin</span>
      </header>

      {/* Drawer — slides in from the left when open. Hidden on md+.
          z-50 so it stacks above the data-page apply bar (z-40). */}
      <div
        className={cn(
          'md:hidden fixed inset-0 z-50 transition-opacity',
          open ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none',
        )}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-overlay-50"
        />

        {/* Panel */}
        <aside
          className={cn(
            'absolute top-0 left-0 h-full w-72 max-w-[80vw] bg-surface-alt border-r border-border flex flex-col',
            'transition-transform duration-200 will-change-transform',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
          // Close the drawer when any link inside is activated. Cleaner than
          // a pathname-watching effect, and works because every nav item is
          // an <a>/<Link>.
          onClick={(e) => {
            if (e.target instanceof HTMLElement && e.target.closest('a')) {
              setOpen(false);
            }
          }}
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="text-xl font-bold text-audius-purple">Compare Admin</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
              className="p-1.5 -mr-1.5 rounded-lg hover:bg-tint-05"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {children}
        </aside>
      </div>
    </>
  );
}
