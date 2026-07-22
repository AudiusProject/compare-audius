// components/seo/StructuredData.tsx
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';
import { buildComparePath } from '@/lib/compare';
import type { Platform, ComparisonRow, Comparison } from '@/types';

/**
 * Serialize an object for embedding inside an inline <script> tag.
 *
 * `JSON.stringify` alone is unsafe here: admin-edited strings can contain
 * `</script>`, `<!--`, or the JS-only line terminators U+2028 / U+2029, all of
 * which let an attacker break out of the script context. Escaping `<`, `>`, `&`,
 * and those line terminators keeps the output valid JSON while preventing any
 * HTML- or JS-parser confusion.
 */
const JSONLD_UNSAFE = new RegExp('[<>&\\u2028\\u2029]', 'g');
function safeJsonLd(schema: unknown): string {
  return JSON.stringify(schema).replace(JSONLD_UNSAFE, (ch) => {
    return '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0');
  });
}

/**
 * Base Organization schema for Audius
 */
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Audius',
    url: 'https://audius.co',
    logo: 'https://cdn.prod.website-files.com/67fec1eb88ef3de9adf4455c/6802c1954e5d6fc2ec61ccd4_y7vxxCf97wWfwEsRoz9xpn3cAsel2_X60gFP4PQnzF8.webp',
    sameAs: [
      'https://twitter.com/audius',
      'https://instagram.com/audiusmusic',
      'https://discord.gg/audius',
      'https://t.me/audius',
    ],
    description: 'Audius is a decentralized music streaming platform that gives artists full control of their content.',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

/**
 * WebSite schema for the comparison site
 */
export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: {
      '@type': 'Organization',
      name: 'Audius',
      url: 'https://audius.co',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

/**
 * Comparison page structured data (FAQPage + ItemList + WebPage), generalized
 * to any number of competitors. 1v1 pages keep the original phrasing so any
 * existing rich results are preserved.
 */
interface ComparisonSchemaProps {
  /** Selected competitors, in URL order */
  competitors: Platform[];
  rows: ComparisonRow[];
}

export function ComparisonSchema({ competitors, rows }: ComparisonSchemaProps) {
  const pageUrl = `${SITE_URL}${buildComparePath(competitors.map((c) => c.slug))}`;
  const vsTitle = ['Audius', ...competitors.map((c) => c.name)].join(' vs ');
  const proseNames = listNames(['Audius', ...competitors.map((c) => c.name)]);
  const single = competitors.length === 1 ? competitors[0] : null;

  // FAQPage schema - each feature comparison becomes a Q&A
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: rows.map((row) => {
      const statuses = row.cells.map((cell, index) => {
        const name = index === 0 ? 'Audius' : competitors[index - 1].name;
        return `${name}: ${formatStatus(cell.status, cell.displayValue, cell.context)}`;
      });

      return {
        '@type': 'Question',
        name: single
          ? `Does Audius or ${single.name} have better ${row.feature.name}?`
          : `How do ${proseNames} compare on ${row.feature.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${row.feature.description} ${statuses.join('. ')}.`,
        },
      };
    }),
  };

  // ItemList schema for the comparison table
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${vsTitle} Feature Comparison`,
    description: `Compare ${rows.length} features between ${proseNames}`,
    url: pageUrl,
    numberOfItems: rows.length,
    itemListElement: rows.map((row, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: row.feature.name,
      description: row.feature.description,
    })),
  };

  // WebPage schema
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${vsTitle} | Feature Comparison`,
    description: `Compare ${proseNames} side by side. See how streaming quality, artist tools, and features stack up.`,
    url: pageUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    about: [
      {
        '@type': 'SoftwareApplication',
        name: 'Audius',
        applicationCategory: 'Music Streaming Service',
        url: 'https://audius.co',
      },
      ...competitors.map((competitor) => ({
        '@type': 'SoftwareApplication',
        name: competitor.name,
        applicationCategory: 'Music Streaming Service',
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(webPageSchema) }}
      />
    </>
  );
}

/**
 * "Audius, Spotify, and SoundCloud" (Oxford comma for 3+)
 */
function listNames(names: string[]): string {
  if (names.length <= 2) return names.join(' and ');
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

/**
 * Format comparison status for human-readable text
 */
function formatStatus(
  status: Comparison['status'],
  displayValue: string | null,
  context: string | null
): string {
  // Context can accompany any visible status, not just partial
  const withContext = (base: string) => (context ? `${base} (${context})` : base);
  switch (status) {
    case 'yes':
      return withContext('Yes, fully supported');
    case 'no':
      return withContext('No, not available');
    case 'partial':
      return context ? `Partially (${context})` : 'Partially supported';
    case 'custom':
      return withContext(displayValue || 'Available');
    default:
      return 'Unknown';
  }
}

/**
 * Combined structured data for layout (Organization + WebSite)
 */
export function LayoutStructuredData() {
  return (
    <>
      <OrganizationSchema />
      <WebSiteSchema />
    </>
  );
}
