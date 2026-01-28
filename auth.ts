// auth.ts

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
      // Always redirect to /admin after sign in
      if (url.includes('/api/auth/callback')) {
        return `${baseUrl}/admin`;
      }
      // Allow relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Allow URLs on the same origin
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
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
