// lib/og-card.tsx
//
// Shared Open Graph / Twitter card renderer. Dark rebrand palette (matches
// app/globals.css tokens). Satori (the OG renderer) doesn't support CSS
// filters, so instead of the site's white-logo filter trick the card uses
// large wordmark typography — which also scales cleanly from 1 to 3
// competitors.
import { ImageResponse } from 'next/og';

export const OG_SIZE = {
  width: 1200,
  height: 630,
};

const colors = {
  purple: '#c67cff',
  bg: '#0a0a0a',
  text: '#ffffff',
  muted: '#737373',
};

function nameFontSize(competitorCount: number): number {
  if (competitorCount <= 1) return 108;
  if (competitorCount === 2) return 88;
  return 68;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg,
        backgroundImage:
          'radial-gradient(circle at 50% -20%, rgba(198, 124, 255, 0.22), rgba(10, 10, 10, 0) 60%)',
        padding: '72px 80px',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Render the comparison share card for a list of competitor names.
 * Falls back to a plain "Audius Compare" card when the list is empty.
 */
export function renderOgCard(competitorNames: string[]): ImageResponse {
  if (competitorNames.length === 0) {
    return new ImageResponse(
      (
        <Card>
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 700, color: colors.text }}>
            Audius Compare
          </div>
        </Card>
      ),
      { ...OG_SIZE }
    );
  }

  const fontSize = nameFontSize(competitorNames.length);

  return new ImageResponse(
    (
      <Card>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: '0.25em',
              color: colors.purple,
            }}
          >
            COMPARE
          </div>

          {/* Wordmark stack */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 1,
              gap: 6,
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize,
                fontWeight: 700,
                color: colors.text,
                lineHeight: 1.05,
              }}
            >
              Audius
            </div>

            {competitorNames.map((name) => (
              <div
                key={name}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 20,
                  fontSize,
                  fontWeight: 700,
                  lineHeight: 1.05,
                }}
              >
                <span style={{ fontSize: fontSize * 0.45, fontWeight: 500, color: colors.muted }}>
                  vs.
                </span>
                <span style={{ color: colors.text }}>{name}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              fontWeight: 500,
              color: colors.purple,
            }}
          >
            compare.audius.co
          </div>
        </div>
      </Card>
    ),
    { ...OG_SIZE }
  );
}
