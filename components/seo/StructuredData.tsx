// components/seo/StructuredData.tsx
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';
import type { Platform, FeatureComparison } from '@/types';

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
 * Comparison page structured data using ItemList schema
 * Represents the feature comparison as a list of items
 */
interface ComparisonSchemaProps {
  competitor: Platform;
  comparisons: FeatureComparison[];
}

export function ComparisonSchema({ competitor, comparisons }: ComparisonSchemaProps) {
  const pageUrl = `${SITE_URL}/${competitor.slug}`;

  // Create FAQPage schema - each feature comparison becomes a Q&A
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: comparisons.map((comparison) => {
      const audiusStatus = formatStatus(comparison.audius.status, comparison.audius.displayValue, comparison.audius.context);
      const competitorStatus = formatStatus(comparison.competitor.status, comparison.competitor.displayValue, comparison.competitor.context);

      return {
        '@type': 'Question',
        name: `Does Audius or ${competitor.name} have better ${comparison.feature.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${comparison.feature.description} Audius: ${audiusStatus}. ${competitor.name}: ${competitorStatus}.`,
        },
      };
    }),
  };

  // Create ItemList schema for the comparison table
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Audius vs ${competitor.name} Feature Comparison`,
    description: `Compare ${comparisons.length} features between Audius and ${competitor.name}`,
    url: pageUrl,
    numberOfItems: comparisons.length,
    itemListElement: comparisons.map((comparison, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: comparison.feature.name,
      description: comparison.feature.description,
    })),
  };

  // Create WebPage schema
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Audius vs ${competitor.name} | Feature Comparison`,
    description: `Compare Audius and ${competitor.name} side by side. See how streaming quality, artist tools, and features stack up.`,
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
      {
        '@type': 'SoftwareApplication',
        name: competitor.name,
        applicationCategory: 'Music Streaming Service',
      },
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
 * Format comparison status for human-readable text
 */
function formatStatus(status: string, displayValue: string | null, context: string | null): string {
  switch (status) {
    case 'yes':
      return 'Yes, fully supported';
    case 'no':
      return 'No, not available';
    case 'partial':
      return context ? `Partially (${context})` : 'Partially supported';
    case 'custom':
      return displayValue || 'Available';
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
