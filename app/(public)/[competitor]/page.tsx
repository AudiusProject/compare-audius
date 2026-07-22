// app/(public)/[competitor]/page.tsx
//
// One dynamic segment handles every comparison: /soundcloud (1v1) and
// /spotify-vs-soundcloud (multi). Audius is implicit and always column 1.
import { notFound, permanentRedirect } from 'next/navigation';
import { ComparisonPage } from '@/components/comparison/ComparisonPage';
import { getComparisonData, getCompetitors, getCompetitorSlugs } from '@/lib/data';
import {
  parseCompareSegment,
  normalizeCompareSlugs,
  canonicalizeCombo,
  buildComparePath,
  isIndexableCombo,
  compareTitle,
} from '@/lib/compare';
import { SITE_URL, SITE_NAME, CURATED_COMBOS } from '@/lib/constants';
import type { Metadata } from 'next';

// Static params: every 1v1 page plus the curated indexable combos.
// Ad-hoc combos still render on demand (dynamicParams defaults to true).
export async function generateStaticParams() {
  const slugs = await getCompetitorSlugs();
  const singles = slugs.map((slug) => ({ competitor: slug }));
  const combos = CURATED_COMBOS
    .filter((combo) => combo.every((slug) => slugs.includes(slug)))
    .map((combo) => ({ competitor: buildComparePath(combo).slice(1) }));
  return [...singles, ...combos];
}

/**
 * Resolve a raw URL segment to validated, canonically-ordered competitor
 * platforms. `competitors` is null when any slug isn't a published competitor.
 */
async function resolveSegment(segment: string) {
  const slugs = canonicalizeCombo(normalizeCompareSlugs(parseCompareSegment(segment)));
  const allCompetitors = slugs.length > 0 ? await getCompetitors() : [];

  const found = slugs.map((slug) => allCompetitors.find((c) => c.slug === slug));
  const competitors =
    slugs.length > 0 && found.every((c) => c !== undefined)
      ? (found as typeof allCompetitors)
      : null;

  return { slugs, competitors, allCompetitors };
}

// Dynamic metadata with comprehensive SEO
export async function generateMetadata(props: {
  params: Promise<{ competitor: string }>
}): Promise<Metadata> {
  const params = await props.params;
  const { slugs, competitors } = await resolveSegment(params.competitor);
  if (!competitors || competitors.length === 0) return {};

  const names = competitors.map((c) => c.name);
  const vsTitle = compareTitle(names);
  const title = `${vsTitle} | Feature Comparison`;
  const description = competitors.length === 1
    ? `Compare Audius and ${names[0]} side by side. See how streaming quality, artist tools, and features stack up. Discover which platform is right for you.`
    : `Compare ${vsTitle} side by side. See how streaming quality, artist tools, and features stack up across all ${competitors.length + 1} platforms.`;

  const path = buildComparePath(slugs);
  const pageUrl = `${SITE_URL}${path}`;
  const indexable = isIndexableCombo(slugs);
  // Non-curated combos funnel their equity to the primary competitor's 1v1 page
  const canonicalUrl = indexable ? pageUrl : `${SITE_URL}/${slugs[0]}`;

  // NOTE: og:image / twitter:image are injected automatically by the
  // opengraph-image.tsx / twitter-image.tsx file conventions (with hashed
  // URLs). Don't set `images` here — a manual URL would 404.
  return {
    title,
    description,
    keywords: [
      ...names.map((name) => `Audius vs ${name}`),
      ...names.map((name) => `${name} alternative`),
      ...names.map((name) => `${name} comparison`),
      'music streaming comparison',
      'artist platform comparison',
      'streaming quality comparison',
      'decentralized music',
    ],
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: vsTitle,
      description: `Compare ${vsTitle}. See streaming quality, features, and more.`,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function CompetitorPage(props: {
  params: Promise<{ competitor: string }>
}) {
  const params = await props.params;
  const { slugs, competitors, allCompetitors } = await resolveSegment(params.competitor);

  // Nothing left after stripping "audius"/dupes → this is just the homepage
  if (slugs.length === 0) {
    permanentRedirect('/');
  }

  // Normalization changed the URL (implicit audius, dupes, over-cap, curated
  // order, casing) → redirect to the canonical form
  const canonicalPath = buildComparePath(slugs);
  if (canonicalPath !== `/${decodeURIComponent(params.competitor)}`) {
    permanentRedirect(canonicalPath);
  }

  if (!competitors) {
    notFound();
  }

  const data = await getComparisonData(slugs);

  return (
    <ComparisonPage
      data={data}
      allCompetitors={allCompetitors}
      indexable={isIndexableCombo(slugs)}
    />
  );
}
