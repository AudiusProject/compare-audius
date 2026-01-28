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
      // Handle callback - redirect to admin
      if (url.includes('callback')) {
        return `${baseUrl}/admin`;
      }
      // Handle relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Handle same-origin URLs
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Default to admin
      return `${baseUrl}/admin`;
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
