// app/layout.tsx
import type { Metadata } from 'next';
import { Urbanist } from 'next/font/google';
import './globals.css';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';
import { LayoutStructuredData } from '@/components/seo/StructuredData';
import { Analytics } from '@vercel/analytics/next';

const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-urbanist',
});

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
    <html lang="en" className={urbanist.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="icon" href="/favicon/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#C67CFF" />
        <meta name="msapplication-config" content="/favicon/browserconfig.xml" />
        <meta name="theme-color" content="#C67CFF" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000" />
        <link rel="stylesheet" href="https://use.typekit.net/inm5qft.css" />
        <LayoutStructuredData />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
