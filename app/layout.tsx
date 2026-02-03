// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';
import { LayoutStructuredData } from '@/components/seo/StructuredData';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Audius vs The Industry | Compare Features',
    template: '%s | Audius Compare',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'Audius',
    'music streaming',
    'Spotify alternative',
    'SoundCloud alternative',
    'decentralized music',
    'artist platform',
    'music comparison',
    'streaming quality',
    'music upload',
    'independent artists',
  ],
  authors: [{ name: 'Audius', url: 'https://audius.co' }],
  creator: 'Audius',
  publisher: 'Audius',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: SITE_NAME,
    title: 'Audius vs The Industry | Compare Features',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@audius',
    creator: '@audius',
    title: 'Audius vs The Industry | Compare Features',
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <LayoutStructuredData />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
