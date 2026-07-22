// Share card for the homepage — the default comparison.
import { getPlatform } from '@/lib/data';
import { DEFAULT_COMPETITOR } from '@/lib/constants';
import { renderOgCard, OG_SIZE } from '@/lib/og-card';

export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function OGImage() {
  const competitor = await getPlatform(DEFAULT_COMPETITOR);
  return renderOgCard(competitor ? [competitor.name] : []);
}
