// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Audius vs The Industry | Compare Features',
    template: '%s | Audius Compare',
  },
  description: 'See how Audius compares to Spotify, SoundCloud, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ fontFamily: 'var(--font-inter), var(--font-sans)' }}>
        {children}
      </body>
    </html>
  );
}
