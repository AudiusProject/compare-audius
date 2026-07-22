// lib/og-card.tsx
//
// Shared Open Graph / Twitter card renderer. Dark rebrand palette (matches
// app/globals.css tokens), typeset in Urbanist like the site itself — Satori
// only renders fonts you hand it, so the TTFs are embedded via lib/og-fonts.ts
// (Urbanist is OFL-licensed; source files in assets/fonts).
//
// Composition: Audius wordmark top-left, a left-aligned versus stack (names
// share one axis, "vs." right-aligned in a fixed gutter), URL bottom-left.
import { ImageResponse } from 'next/og';
import { urbanistBlack, urbanistSemiBold } from './og-fonts';

export const OG_SIZE = {
  width: 1200,
  height: 630,
};

const colors = {
  purple: '#c67cff',
  bg: '#0a0a0a',
  text: '#ffffff',
  muted: '#6f6f78',
};

// SVG paths from components/ui/Icon.tsx (AudiusLogo)
const LOGO_PATHS = [
  'M95.4932 14.0509C91.408 6.96185 89.3609 3.41732 86.6929 2.22982C84.3624 1.19075 81.7034 1.19075 79.3728 2.22532C76.7003 3.41283 74.6532 6.95286 70.5545 14.0374L7.13927 123.693C3.04506 130.777 0.993454 134.318 1.29939 137.223C1.56484 139.76 2.89209 142.063 4.95719 143.566C7.31923 145.284 11.4134 145.288 19.5974 145.293L42.372 145.306C45.3999 145.306 46.9161 145.306 48.2703 144.87C49.4716 144.483 50.5739 143.845 51.5142 143.003C52.5715 142.05 53.3319 140.741 54.8481 138.118L78.1446 97.8332C78.2795 97.5993 78.428 97.3789 78.5855 97.1764C80.9565 94.1312 85.8021 94.3516 87.8132 97.8377L115.375 145.635C115.622 146.062 115.802 146.503 115.924 146.944C116.878 150.362 114.34 154.006 110.534 154.001L64.8856 153.97C61.8577 153.97 60.3415 153.97 58.9873 154.406C57.786 154.793 56.6837 155.432 55.7434 156.273C54.6861 157.227 53.9257 158.535 52.4095 161.158L41.0087 180.869C36.9145 187.953 34.8629 191.493 35.1689 194.399C35.4343 196.936 36.7616 199.239 38.8267 200.741C41.1887 202.46 45.2829 202.464 53.4668 202.469L179.276 202.55C187.46 202.554 191.55 202.559 193.916 200.84C195.981 199.343 197.313 197.04 197.579 194.507C197.884 191.601 195.842 188.057 191.757 180.968L95.4932 14.0509Z',
  'M261.007 160.15C259.185 160.15 257.953 158.294 258.662 156.618L306.317 44.0502C306.715 43.1094 307.639 42.498 308.662 42.498H336.541C337.564 42.498 338.488 43.1094 338.886 44.0502L386.541 156.618C387.251 158.294 386.018 160.15 384.196 160.15H354.982C353.948 160.15 353.016 159.525 352.625 158.568L345.394 140.871C345.003 139.915 344.071 139.29 343.037 139.29H301.344C300.303 139.29 299.367 139.922 298.98 140.887L291.903 158.552C291.517 159.517 290.581 160.15 289.54 160.15H261.007ZM310.53 110.611C309.867 112.279 311.098 114.09 312.897 114.09H331.656C333.449 114.09 334.68 112.288 334.026 110.621L324.706 86.8802C323.863 84.7329 320.822 84.7263 319.97 86.8699L310.53 110.611Z',
  'M467.36 162.319C434.1 162.319 413.207 145.464 413.207 108.917V45.8743C413.207 44.4704 414.347 43.3324 415.753 43.3324H443.588C444.994 43.3324 446.134 44.4704 446.134 45.8743V108.25C446.134 125.105 454.658 133.115 467.694 133.115C480.731 133.115 489.255 125.438 489.255 109.084V45.8743C489.255 44.4704 490.395 43.3324 491.801 43.3324H519.636C521.042 43.3324 522.181 44.4704 522.181 45.8743V108.083C522.181 145.798 500.621 162.319 467.36 162.319Z',
  'M563.973 160.15C562.567 160.15 561.427 159.012 561.427 157.608V45.8743C561.427 44.4704 562.567 43.3324 563.973 43.3324H606.555C648.339 43.3324 672.574 67.3634 672.574 101.074V101.407C672.574 135.118 648.005 160.15 605.886 160.15H563.973ZM593.852 128.904C593.852 130.308 594.992 131.446 596.398 131.446H607.056C626.444 131.446 639.314 120.766 639.314 101.908V101.574C639.314 82.8835 626.444 72.0362 607.056 72.0362H596.398C594.992 72.0362 593.852 73.1742 593.852 74.578V128.904Z',
  'M712.5 160.15C711.094 160.15 709.955 159.012 709.955 157.608V45.8743C709.955 44.4704 711.094 43.3324 712.5 43.3324H740.001C741.407 43.3324 742.546 44.4704 742.546 45.8743V157.608C742.546 159.012 741.407 160.15 740.001 160.15H712.5Z',
  'M836.67 162.319C803.409 162.319 782.517 145.464 782.517 108.917V45.8743C782.517 44.4704 783.657 43.3324 785.063 43.3324H812.898C814.304 43.3324 815.443 44.4704 815.443 45.8743V108.25C815.443 125.105 823.968 133.115 837.004 133.115C850.041 133.115 858.565 125.438 858.565 109.084V45.8743C858.565 44.4704 859.705 43.3324 861.111 43.3324H888.945C890.351 43.3324 891.491 44.4704 891.491 45.8743V108.083C891.491 145.798 869.93 162.319 836.67 162.319Z',
  'M976.7 162.153C956.857 162.153 937.934 156.186 923.743 144.401C922.688 143.524 922.578 141.96 923.46 140.909L938.334 123.169C939.222 122.111 940.79 121.957 941.899 122.782C952.92 130.977 965.098 135.285 977.87 135.285C986.561 135.285 991.241 132.281 991.241 127.274V126.94C991.241 122.101 987.397 119.431 971.519 115.759C946.615 110.085 927.395 103.076 927.395 79.0452V78.7114C927.395 57.0168 944.61 41.3298 972.689 41.3298C991.6 41.3298 1006.58 46.1578 1018.93 55.3834C1020.01 56.1889 1020.22 57.7058 1019.44 58.803L1006.08 77.645C1005.27 78.7881 1003.69 79.0568 1002.51 78.2912C992.398 71.6987 981.541 68.1979 971.853 68.1979C963.998 68.1979 960.154 71.5355 960.154 75.7076V76.0413C960.154 81.3816 964.165 83.7179 980.377 87.3893C1007.29 93.2302 1024 101.908 1024 123.77V124.103C1024 147.968 1005.11 162.153 976.7 162.153Z',
];

function AudiusWordmark({ height }: { height: number }) {
  return (
    <svg
      width={(height * 1024) / 204}
      height={height}
      viewBox="0 0 1024 204"
      fill="none"
    >
      {LOGO_PATHS.map((d, i) => (
        <path key={i} d={d} fill={colors.text} />
      ))}
    </svg>
  );
}

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 600 | 900;
  style: 'normal';
};

let fonts: OgFont[] | null = null;

function loadFonts(): OgFont[] {
  fonts ??= [
    { name: 'Urbanist', data: urbanistBlack(), weight: 900, style: 'normal' },
    { name: 'Urbanist', data: urbanistSemiBold(), weight: 600, style: 'normal' },
  ];
  return fonts;
}

function headlineFontSize(competitorCount: number): number {
  if (competitorCount <= 1) return 112;
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
        justifyContent: 'space-between',
        backgroundColor: colors.bg,
        backgroundImage:
          'radial-gradient(circle at 82% 18%, rgba(198, 124, 255, 0.16), rgba(10, 10, 10, 0) 52%)',
        padding: '64px 72px',
        fontFamily: 'Urbanist',
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
  const fonts = loadFonts();

  if (competitorNames.length === 0) {
    return new ImageResponse(
      (
        <Card>
          <AudiusWordmark height={40} />
          <div style={{ display: 'flex', fontSize: 88, fontWeight: 900, color: colors.text }}>
            Compare
          </div>
          <div style={{ display: 'flex', fontSize: 26, fontWeight: 600, color: colors.purple }}>
            compare.audius.co
          </div>
        </Card>
      ),
      { ...OG_SIZE, fonts }
    );
  }

  const fontSize = headlineFontSize(competitorNames.length);
  // Fixed gutter so every name sits on one shared left axis. The wordmark
  // plays the "Audius" role, so each line reads "vs. {competitor}".
  const gutterWidth = fontSize * 1.1;
  const gutterGap = fontSize * 0.2;

  return new ImageResponse(
    (
      <Card>
        {/* Wordmark */}
        <AudiusWordmark height={44} />

        {/* Versus stack — names share a left axis, "vs." right-aligned in the gutter */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flexGrow: 1,
            paddingTop: 24,
            paddingBottom: 24,
          }}
        >
          {competitorNames.map((name) => (
            <div
              key={name}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                lineHeight: 1.18,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  width: gutterWidth,
                  marginRight: gutterGap,
                  fontSize: fontSize * 0.5,
                  fontWeight: 900,
                  color: colors.purple,
                }}
              >
                vs.
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize,
                  fontWeight: 900,
                  color: colors.text,
                  letterSpacing: '-0.02em',
                }}
              >
                {name}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', fontSize: 26, fontWeight: 600, color: colors.purple }}>
          compare.audius.co
        </div>
      </Card>
    ),
    { ...OG_SIZE, fonts }
  );
}
