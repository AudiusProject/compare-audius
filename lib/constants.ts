// lib/constants.ts

/**
 * Site configuration
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://compare.audius.co';
export const SITE_NAME = 'Audius Compare';
export const SITE_DESCRIPTION = 'See how Audius compares to Spotify, SoundCloud, and more. Compare streaming quality, features, and discover why artists choose Audius.';

/**
 * Default competitor shown on the root URL (/)
 */
export const DEFAULT_COMPETITOR = 'soundcloud';

/**
 * External URLs used throughout the site
 * Verify all URLs before launch
 */
export const EXTERNAL_URLS = {
  // Main Audius app
  audiusApp: 'https://audius.co',
  audiusMusic: 'https://audius.co/trending',
  
  // More dropdown links
  blog: 'https://blog.audius.co',
  helpCenter: 'https://support.audius.co',
  
  // Social links
  instagram: 'https://instagram.com/audiusmusic',
  twitter: 'https://twitter.com/audius',
  discord: 'https://discord.gg/audius',
  telegram: 'https://t.me/audius',
  
  // Footer links
  download: 'https://audius.co/download',
  events: 'https://audius.co/events',
  merchStore: 'https://store.audius.co',
  brandPress: 'https://audius.co/brand',
  engineering: 'https://audius.co/engineering',
  openAudioFoundation: 'https://openaudius.org',
  termsOfService: 'https://audius.co/legal/terms-of-use',
  privacyPolicy: 'https://audius.co/legal/privacy-policy',
} as const;

/**
 * Type for external URL keys
 */
export type ExternalUrlKey = keyof typeof EXTERNAL_URLS;
