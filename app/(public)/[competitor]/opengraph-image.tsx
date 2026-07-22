import { getCompetitors } from '@/lib/data';
import {
  parseCompareSegment,
  normalizeCompareSlugs,
  canonicalizeCombo,
} from '@/lib/compare';
import { renderOgCard, OG_SIZE } from '@/lib/og-card';

export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function OGImage({
  params
}: {
  params: Promise<{ competitor: string }>
}) {
  const { competitor: segment } = await params;

  const slugs = canonicalizeCombo(normalizeCompareSlugs(parseCompareSegment(segment)));
  const allCompetitors = await getCompetitors();
  const names = slugs
    .map((slug) => allCompetitors.find((c) => c.slug === slug)?.name)
    .filter((name): name is string => name !== undefined);

  return renderOgCard(names);
}
