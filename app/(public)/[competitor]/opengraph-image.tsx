import { ImageResponse } from 'next/og';
import { getPlatform, getAudius } from '@/lib/data';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

const colors = {
  purple: '#7f0cda',
  textPrimary: '#3c3a45',
  textMuted: '#6b6b6b',
  bg: '#fafafa',
};

export default async function OGImage({
  params
}: {
  params: Promise<{ competitor: string }>
}) {
  const { competitor: slug } = await params;

  const [competitor, audius] = await Promise.all([
    getPlatform(slug),
    getAudius(),
  ]);

  if (!competitor) {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, fontSize: 48, fontWeight: 700, color: colors.textPrimary }}>
          Audius Compare
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.bg,
          padding: '80px',
          gap: 60,
        }}
      >
        {/* Logos row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 60,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={audius.logo}
            width={400}
            height={180}
            style={{ objectFit: 'contain' }}
          />

          <span
            style={{
              fontSize: 72,
              fontWeight: 500,
              color: colors.textMuted,
            }}
          >
            vs.
          </span>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={competitor.logo}
            width={400}
            height={180}
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* Text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <span
            style={{
              fontSize: 48,
              color: colors.textPrimary,
            }}
          >
            See how we stack up against the bigger fish.
          </span>

          <span
            style={{
              fontSize: 36,
              fontWeight: 500,
              color: colors.purple,
            }}
          >
            compare.audius.co
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
