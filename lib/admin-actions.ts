'use server';

// lib/admin-actions.ts
//
// Server actions reusable across admin server + client components.
// The inline `'use server'` form action inside layout.tsx only works for
// server components — extracting the action here lets the mobile nav drawer
// (a client component) call it via <form action={signOutAction}>.

import { signOut } from '@/auth';
import { getRequestOrigin } from '@/lib/origin';

export async function signOutAction() {
  const origin = await getRequestOrigin();
  const redirectTo = origin ? `${origin}/login` : '/login';
  await signOut({ redirectTo });
}
