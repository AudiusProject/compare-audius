// auth.ts

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

function toOrigin(value?: string | null): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const withScheme =
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`;
    return new URL(withScheme).origin;
  } catch {
    return null;
  }
}

function getAllowedOrigins(baseUrl: string): Set<string> {
  const origins = new Set<string>();
  const baseOrigin = toOrigin(baseUrl);
  if (baseOrigin) {
    origins.add(baseOrigin);
  }

  const envCandidates = [
    process.env.AUTH_URL,
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of envCandidates) {
    const origin = toOrigin(candidate || null);
    if (origin) {
      origins.add(origin);
    }
  }

  const extraOrigins = process.env.AUTH_ALLOWED_ORIGINS;
  if (extraOrigins) {
    for (const originValue of extraOrigins.split(',')) {
      const origin = toOrigin(originValue);
      if (origin) {
        origins.add(origin);
      }
    }
  }

  return origins;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId:
        process.env.GOOGLE_CLIENT_ID ||
        process.env.AUTH_GOOGLE_ID ||
        '',
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ||
        process.env.AUTH_GOOGLE_SECRET ||
        '',
    }),
  ],
  callbacks: {
    signIn({ user }) {
      const email = user.email;
      
      // Whitelist specific emails for testing/contractors
      const whitelist = ['me@julianbaker.design'];
      
      // Allow @audius.co emails OR whitelisted emails
      if (email?.endsWith('@audius.co') || whitelist.includes(email || '')) {
        return true;
      }
      
      return false;
    },
    redirect({ url, baseUrl }) {
      const allowedOrigins = getAllowedOrigins(baseUrl);

      if (url.startsWith('/')) {
        if (url.startsWith('/api/auth/callback')) {
          return `${baseUrl}/admin`;
        }
        return `${baseUrl}${url}`;
      }

      try {
        const targetUrl = new URL(url);
        if (!allowedOrigins.has(targetUrl.origin)) {
          return `${baseUrl}/admin`;
        }
        if (targetUrl.pathname.startsWith('/api/auth/callback')) {
          return `${targetUrl.origin}/admin`;
        }
        return targetUrl.toString();
      } catch {
        return `${baseUrl}/admin`;
      }
    },
    session({ session, token }) {
      // Add user id to session
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
});
