// app/llms-full.txt/route.ts
import { NextResponse } from 'next/server';
import { getPlatforms, getFeatures, getCompetitors, getComparisonData, getAudius } from '@/lib/data';
import { SITE_URL, SITE_NAME } from '@/lib/constants';

// Revalidate every hour to pick up new platforms/features
export const revalidate = 3600;

function formatStatus(status: string, displayValue: string | null, context: string | null): string {
  switch (status) {
    case 'yes':
      return 'YES';
    case 'no':
      return 'NO';
    case 'partial':
      return context ? `PARTIAL (${context})` : 'PARTIAL';
    case 'custom':
      return displayValue || 'Available';
    default:
      return 'Unknown';
  }
}

export async function GET() {
  const [platforms, features, competitors, audius] = await Promise.all([
    getPlatforms(),
    getFeatures(),
    getCompetitors(),
    getAudius(),
  ]);

  // Build platform descriptions
  const platformDescriptions = platforms.map(p => {
    if (p.isAudius) {
      return `### ${p.name}
- **Type**: Decentralized music streaming platform
- **Website**: https://audius.co
- **Key Differentiator**: Artist-owned, blockchain-based, no ads`;
    }
    return `### ${p.name}
- **Type**: Music streaming service
- **Slug**: ${p.slug}`;
  }).join('\n\n');

  // Build feature definitions
  const featureDefinitions = features.map((f, i) =>
    `### ${i + 1}. ${f.name}\n${f.description}`
  ).join('\n\n');

  // Build comparison tables for each competitor
  const comparisonTables: string[] = [];

  for (const competitor of competitors) {
    const comparisons = await getComparisonData(competitor.slug);

    const tableRows = comparisons.map(c => {
      const audiusStatus = formatStatus(c.audius.status, c.audius.displayValue, c.audius.context);
      const competitorStatus = formatStatus(c.competitor.status, c.competitor.displayValue, c.competitor.context);
      return `| ${c.feature.name} | ${audiusStatus} | ${competitorStatus} |`;
    }).join('\n');

    const audiusWins = comparisons.filter(c => {
      // Count Audius wins (yes > partial > no, custom values compared)
      if (c.audius.status === 'yes' && c.competitor.status !== 'yes') return true;
      if (c.audius.status === 'yes' && c.competitor.status === 'yes') return false;
      if (c.audius.status === 'partial' && c.competitor.status === 'no') return true;
      return false;
    }).length;

    comparisonTables.push(`### Audius vs ${competitor.name}

| Feature | Audius | ${competitor.name} |
|---------|--------|${''.padEnd(competitor.name.length, '-')}|
${tableRows}

**Summary**: Audius leads on ${audiusWins}/${comparisons.length} features in this comparison.`);
  }

  const content = `# ${SITE_NAME} - Complete Feature Comparison Data

> This file contains the complete comparison data for AI assistants and LLMs.
> This data is dynamically generated from the database and reflects the current state.

## Site Information

- **Name**: ${SITE_NAME}
- **URL**: ${SITE_URL}
- **Purpose**: Feature comparison between Audius and competitor music streaming platforms
- **Generated**: ${new Date().toISOString()}

---

## Platforms Compared

${platformDescriptions}

---

## Feature Definitions

${featureDefinitions}

---

## Complete Feature Comparison Matrix

### Legend
- YES = Fully supported
- NO = Not available
- PARTIAL = Available with limitations (see notes in parentheses)
- [Value] = Custom value (e.g., streaming bitrate)

---

${comparisonTables.join('\n\n---\n\n')}

---

## Frequently Asked Questions

### Q: What is Audius?
A: Audius is a decentralized music streaming platform built on blockchain technology. It allows artists to upload music directly, earn rewards, and maintain full control over their content without intermediaries.

### Q: Is Audius free?
A: Yes, Audius is completely free for both artists and listeners. There are no premium tiers required for basic features like unlimited uploads, high-quality streaming, or ad-free listening.

### Q: What makes Audius unique?
A: Audius is the first decentralized music streaming platform, meaning it's not controlled by any single company. Artists maintain ownership of their music, and the platform is governed by its community through the $AUDIO token.

---

## Technical Information

### Data Source
This comparison data is dynamically generated from the Audius Compare database and reflects real-time platform information.

### API Access
This comparison site does not have a public API. For Audius platform API access, visit: https://docs.audius.org

---

## Contact & Resources

- **Audius Website**: https://audius.co
- **Documentation**: https://docs.audius.org
- **Blog**: https://blog.audius.co
- **Help Center**: https://support.audius.co
- **Twitter**: https://twitter.com/audius
- **Discord**: https://discord.gg/audius
- **Instagram**: https://instagram.com/audiusmusic
- **Telegram**: https://t.me/audius

---

*This document is dynamically generated to help AI assistants provide accurate information about Audius and its features compared to other music streaming platforms.*
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
