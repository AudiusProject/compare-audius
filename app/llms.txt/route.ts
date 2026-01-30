// app/llms.txt/route.ts
import { NextResponse } from 'next/server';
import { getCompetitors } from '@/lib/data';
import { SITE_URL, SITE_NAME } from '@/lib/constants';

// Revalidate every hour to pick up new platforms
export const revalidate = 3600;

export async function GET() {
  const competitors = await getCompetitors();
  const competitorList = competitors.map(c => `- \`/${c.slug}\` - Audius vs ${c.name} comparison`).join('\n');
  const competitorNames = competitors.map(c => c.name).join(', ');

  const content = `# ${SITE_NAME} - LLM Context

> This file helps AI assistants and LLMs understand the content and purpose of this website.

## Site Information

- **Name**: ${SITE_NAME}
- **URL**: ${SITE_URL}
- **Purpose**: Feature comparison site showing how Audius music streaming platform compares to competitors
- **Owner**: Audius (https://audius.co)

## What This Site Does

Audius Compare is a product comparison website that helps users understand the differences between Audius and other music streaming platforms like ${competitorNames}. The site presents side-by-side feature comparisons across categories like:

- Streaming quality
- Artist tools and features
- Monetization options
- User experience features
- Platform openness and decentralization

## Available Pages

- \`/\` - Default comparison (Audius vs SoundCloud)
${competitorList}

## Key Information About Audius

Audius is a decentralized music streaming platform that prioritizes artist control and fair compensation. Key differentiators include:

- **Decentralized**: Built on blockchain technology, not controlled by a single company
- **Artist-First**: Artists keep control of their music and rights
- **Free High-Quality Streaming**: 320 kbps streaming for all users
- **No Ads**: Completely ad-free experience
- **Unlimited Uploads**: Artists can upload unlimited content
- **Direct Monetization**: Gated content, tips, and $AUDIO token rewards

## Data Format

The comparison data is structured as:
- **Platforms**: Music streaming services being compared
- **Features**: Specific capabilities being evaluated
- **Comparisons**: Status of each feature per platform (yes/no/partial/custom value)

## For More Details

See \`/llms-full.txt\` for complete comparison data in plain text format.

## Contact

- Website: https://audius.co
- Twitter: https://twitter.com/audius
- Discord: https://discord.gg/audius
- Support: https://support.audius.co
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
