# Backend Implementation Plan

> **Parent Document:** [PROJECT_PLAN.md](./PROJECT_PLAN.md)  
> **Scope:** Project setup, data layer, types, utilities  
> **Depends On:** Nothing  
> **Blocks:** Frontend implementation

---

## Overview

Set up the Next.js project foundation and data layer. This work must be completed before frontend development can begin. The "backend" for this project is minimal—there's no API or database. It's purely static site generation with JSON data files.

---

## Deliverables

| # | Deliverable | Output |
|---|-------------|--------|
| 1 | Project scaffolding | Working Next.js 14+ project with TypeScript & Tailwind |
| 2 | Type definitions | `types/index.ts` with all interfaces |
| 3 | Data migration | `data/*.json` files generated from CSV |
| 4 | Data utilities | `lib/data.ts` with all data access functions |
| 5 | Constants | `lib/constants.ts` with URLs and config |
| 6 | Basic routing | `app/page.tsx` and `app/[competitor]/page.tsx` stubs |

---

## Task 1: Project Scaffolding

### 1.1 Initialize Next.js Project

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

### 1.2 Verify Project Structure

After initialization, ensure this structure exists:

```
compare-audius/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── public/
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
└── package.json
```

### 1.3 Create Additional Directories

```bash
mkdir -p components/layout components/comparison components/ui
mkdir -p data lib types scripts
```

### 1.4 Update package.json Scripts

Add a type-check script:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### 1.5 Install Additional Dependencies

```bash
npm install clsx
```

> `clsx` is the only additional dependency needed for conditional classNames.

---

## Task 2: Type Definitions

### 2.1 Create `types/index.ts`

```typescript
// types/index.ts

/**
 * Comparison status types
 * - yes: Feature fully available (green checkmark)
 * - no: Feature not available (red X)
 * - partial: Feature partially available with context (gray dash)
 * - custom: Custom display value instead of icon (e.g., "320 kbps")
 */
export type ComparisonStatus = 'yes' | 'no' | 'partial' | 'custom';

/**
 * Platform (Audius, Spotify, SoundCloud)
 */
export interface Platform {
  id: string;
  name: string;
  slug: string;
  logo: string;
  isAudius: boolean;
}

/**
 * Feature being compared
 */
export interface Feature {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
}

/**
 * Single comparison record (Platform × Feature)
 */
export interface Comparison {
  id: string;
  platformId: string;
  featureId: string;
  status: ComparisonStatus;
  displayValue: string | null;
  context: string | null;
}

/**
 * Computed type for rendering a feature row
 * Contains the feature and both platform comparisons
 */
export interface FeatureComparison {
  feature: Feature;
  audius: Comparison;
  competitor: Comparison;
}

/**
 * Props for comparison page components
 */
export interface ComparisonPageProps {
  competitor: Platform;
  competitors: Platform[];
  comparisons: FeatureComparison[];
}
```

---

## Task 3: Data Migration

### 3.1 Create Migration Script

Create `scripts/migrate-csv.ts`:

```typescript
// scripts/migrate-csv.ts
/**
 * One-time migration script: CSV → JSON
 * 
 * Run with: npx tsx scripts/migrate-csv.ts
 * 
 * Input:  webflow-csv-data/*.csv
 * Output: data/*.json
 */

import * as fs from 'fs';
import * as path from 'path';

// --- Types for migration ---
interface RawPlatform {
  Name: string;
  Slug: string;
  Logo: string;
}

interface RawFeature {
  Feature: string;
  Slug: string;
  Description: string;
  'Sort (String)': string;
}

interface RawComparison {
  'Unique Semantic Name': string;
  'Linked Platform': string;
  'Linked Feature': string;
  Status: string;
  Context: string;
}

// --- Helpers ---
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    // Handle commas within quoted fields
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const record: Record<string, string> = {};
    headers.forEach((header, i) => {
      record[header] = values[i] || '';
    });
    return record;
  });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// --- Platform slug normalization ---
const PLATFORM_SLUG_MAP: Record<string, string> = {
  'audiusmusic': 'audius',
  'spotify': 'spotify',
  'soundcloud': 'soundcloud',
};

// --- Feature ID mapping (Airtable Record ID → slug) ---
// This will be populated during feature processing
const featureIdToSlug: Record<string, string> = {};

// --- Main migration ---
async function migrate() {
  const csvDir = path.join(process.cwd(), 'webflow-csv-data');
  const dataDir = path.join(process.cwd(), 'data');
  
  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // --- Process Platforms ---
  console.log('Processing platforms...');
  const platformsCSV = fs.readFileSync(
    path.join(csvDir, 'Compare _ Audius vs. Others - Platforms.csv'),
    'utf-8'
  );
  const rawPlatforms = parseCSV(platformsCSV);
  
  const platforms = rawPlatforms.map(p => {
    const originalSlug = p.Slug;
    const normalizedSlug = PLATFORM_SLUG_MAP[originalSlug] || originalSlug;
    
    return {
      id: normalizedSlug,
      name: p.Name,
      slug: normalizedSlug,
      logo: p.Logo,
      isAudius: normalizedSlug === 'audius',
    };
  });
  
  fs.writeFileSync(
    path.join(dataDir, 'platforms.json'),
    JSON.stringify(platforms, null, 2)
  );
  console.log(`  ✓ Wrote ${platforms.length} platforms`);
  
  // --- Process Features ---
  console.log('Processing features...');
  const featuresCSV = fs.readFileSync(
    path.join(csvDir, 'Compare _ Audius vs. Others - Features.csv'),
    'utf-8'
  );
  const rawFeatures = parseCSV(featuresCSV);
  
  const features = rawFeatures.map(f => {
    const slug = slugify(f.Feature);
    const airtableId = f.Slug; // The "Slug" column contains Airtable Record ID
    
    // Build the mapping for comparisons
    featureIdToSlug[airtableId] = slug;
    
    return {
      id: slug,
      name: f.Feature,
      slug: slug,
      description: f.Description,
      sortOrder: parseInt(f['Sort (String)'], 10) || 999,
    };
  }).sort((a, b) => a.sortOrder - b.sortOrder);
  
  fs.writeFileSync(
    path.join(dataDir, 'features.json'),
    JSON.stringify(features, null, 2)
  );
  console.log(`  ✓ Wrote ${features.length} features`);
  
  // --- Process Comparisons ---
  console.log('Processing comparisons...');
  const comparisonsCSV = fs.readFileSync(
    path.join(csvDir, 'Compare _ Audius vs. Others - Comparisons.csv'),
    'utf-8'
  );
  const rawComparisons = parseCSV(comparisonsCSV);
  
  const comparisons = rawComparisons.map(c => {
    const platformSlug = PLATFORM_SLUG_MAP[c['Linked Platform']] || c['Linked Platform'];
    const featureSlug = featureIdToSlug[c['Linked Feature']] || slugify(c['Linked Feature']);
    
    // Determine status
    let status: 'yes' | 'no' | 'partial' | 'custom';
    let displayValue: string | null = null;
    let context: string | null = null;
    
    const rawStatus = c.Status.trim().toLowerCase();
    
    if (rawStatus === 'yes') {
      status = 'yes';
    } else if (rawStatus === 'no') {
      status = 'no';
    } else if (rawStatus === 'partial') {
      status = 'partial';
      context = c.Context || null;
    } else {
      // Empty status with context = custom display value
      status = 'custom';
      displayValue = c.Context || null;
    }
    
    return {
      id: `${platformSlug}-${featureSlug}`,
      platformId: platformSlug,
      featureId: featureSlug,
      status,
      displayValue,
      context,
    };
  });
  
  fs.writeFileSync(
    path.join(dataDir, 'comparisons.json'),
    JSON.stringify(comparisons, null, 2)
  );
  console.log(`  ✓ Wrote ${comparisons.length} comparisons`);
  
  // --- Validation ---
  console.log('\nValidating data integrity...');
  const platformIds = new Set(platforms.map(p => p.id));
  const featureIds = new Set(features.map(f => f.id));
  
  let errors = 0;
  for (const comp of comparisons) {
    if (!platformIds.has(comp.platformId)) {
      console.error(`  ✗ Invalid platform: ${comp.platformId} in ${comp.id}`);
      errors++;
    }
    if (!featureIds.has(comp.featureId)) {
      console.error(`  ✗ Invalid feature: ${comp.featureId} in ${comp.id}`);
      errors++;
    }
  }
  
  if (errors === 0) {
    console.log('  ✓ All references valid');
  } else {
    console.error(`  ✗ Found ${errors} errors`);
    process.exit(1);
  }
  
  console.log('\n✓ Migration complete!');
}

migrate().catch(console.error);
```

### 3.2 Run Migration

```bash
npx tsx scripts/migrate-csv.ts
```

### 3.3 Verify Output

Check that `data/` contains:
- `platforms.json` (3 records)
- `features.json` (15 records, sorted by sortOrder)
- `comparisons.json` (45 records)

Spot-check a few records to ensure:
- Platform slugs are normalized (`audius`, not `audiusmusic`)
- Feature descriptions are preserved
- Status values are lowercase (`yes`/`no`/`partial`/`custom`)
- Custom display values (e.g., "320 kbps") are in `displayValue` field
- Partial context (e.g., "Premium Subscription Required") is in `context` field

---

## Task 4: Data Utilities

### 4.1 Create `lib/data.ts`

```typescript
// lib/data.ts

import platformsData from '@/data/platforms.json';
import featuresData from '@/data/features.json';
import comparisonsData from '@/data/comparisons.json';
import type { Platform, Feature, Comparison, FeatureComparison } from '@/types';

// Type assertions for imported JSON
const platforms = platformsData as Platform[];
const features = featuresData as Feature[];
const comparisons = comparisonsData as Comparison[];

/**
 * Get all platforms
 */
export function getPlatforms(): Platform[] {
  return platforms;
}

/**
 * Get a single platform by slug
 */
export function getPlatform(slug: string): Platform | undefined {
  return platforms.find(p => p.slug === slug);
}

/**
 * Get Audius platform
 */
export function getAudius(): Platform {
  const audius = platforms.find(p => p.isAudius);
  if (!audius) throw new Error('Audius platform not found in data');
  return audius;
}

/**
 * Get all competitor platforms (non-Audius)
 */
export function getCompetitors(): Platform[] {
  return platforms.filter(p => !p.isAudius);
}

/**
 * Get all features sorted by sortOrder
 */
export function getFeatures(): Feature[] {
  return [...features].sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get a single feature by slug
 */
export function getFeature(slug: string): Feature | undefined {
  return features.find(f => f.slug === slug);
}

/**
 * Get comparison for a specific platform and feature
 */
export function getComparison(platformId: string, featureId: string): Comparison | undefined {
  return comparisons.find(
    c => c.platformId === platformId && c.featureId === featureId
  );
}

/**
 * Get full comparison data for a competitor
 * Returns array of FeatureComparison objects ready for rendering
 */
export function getComparisonData(competitorSlug: string): FeatureComparison[] {
  const audius = getAudius();
  const competitor = getPlatform(competitorSlug);
  
  if (!competitor) {
    throw new Error(`Unknown competitor: ${competitorSlug}`);
  }
  
  if (competitor.isAudius) {
    throw new Error('Cannot compare Audius to itself');
  }
  
  const featureList = getFeatures();
  
  return featureList.map(feature => {
    const audiusComparison = getComparison(audius.id, feature.id);
    const competitorComparison = getComparison(competitor.id, feature.id);
    
    if (!audiusComparison) {
      throw new Error(`Missing Audius comparison for feature: ${feature.id}`);
    }
    if (!competitorComparison) {
      throw new Error(`Missing ${competitor.name} comparison for feature: ${feature.id}`);
    }
    
    return {
      feature,
      audius: audiusComparison,
      competitor: competitorComparison,
    };
  });
}

/**
 * Check if a slug is a valid competitor
 */
export function isValidCompetitor(slug: string): boolean {
  return getCompetitors().some(c => c.slug === slug);
}

/**
 * Get all valid competitor slugs (for generateStaticParams)
 */
export function getCompetitorSlugs(): string[] {
  return getCompetitors().map(c => c.slug);
}
```

---

## Task 5: Constants

### 5.1 Create `lib/constants.ts`

```typescript
// lib/constants.ts

/**
 * Default competitor shown on the root URL (/)
 */
export const DEFAULT_COMPETITOR = 'soundcloud';

/**
 * External URLs used throughout the site
 * Verify all URLs before launch
 */
export const EXTERNAL_URLS = {
  // Main Audius app
  audiusApp: 'https://audius.co',
  audiusMusic: 'https://audius.co/trending',
  
  // More dropdown links
  blog: 'https://blog.audius.co',
  helpCenter: 'https://support.audius.co',
  
  // Social links
  instagram: 'https://instagram.com/audiusmusic',
  twitter: 'https://twitter.com/audius',
  discord: 'https://discord.gg/audius',
  telegram: 'https://t.me/audius',
  
  // Footer links
  download: 'https://audius.co/download',
  events: 'https://audius.co/events',
  merchStore: 'https://store.audius.co',
  brandPress: 'https://audius.co/brand',
  engineering: 'https://audius.co/engineering',
  openAudioFoundation: 'https://openaudius.org',
  termsOfService: 'https://audius.co/legal/terms-of-use',
  privacyPolicy: 'https://audius.co/legal/privacy-policy',
} as const;

/**
 * Type for external URL keys
 */
export type ExternalUrlKey = keyof typeof EXTERNAL_URLS;
```

### 5.2 Create `lib/utils.ts`

```typescript
// lib/utils.ts

import { clsx, type ClassValue } from 'clsx';

/**
 * Merge class names conditionally
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
```

---

## Task 6: Basic Routing Stubs

Create minimal page files that the frontend team can build upon.

### 6.1 Create `app/layout.tsx`

```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Audius vs The Industry | Compare Features',
    template: '%s | Audius Compare',
  },
  description: 'See how Audius compares to Spotify, SoundCloud, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Header component will be added by frontend */}
        <main>{children}</main>
        {/* Footer component will be added by frontend */}
      </body>
    </html>
  );
}
```

### 6.2 Create `app/page.tsx`

```typescript
// app/page.tsx
import { getComparisonData, getPlatform, getCompetitors } from '@/lib/data';
import { DEFAULT_COMPETITOR } from '@/lib/constants';

export default async function HomePage() {
  const competitor = getPlatform(DEFAULT_COMPETITOR)!;
  const competitors = getCompetitors();
  const comparisons = getComparisonData(DEFAULT_COMPETITOR);
  
  // TODO: Replace with ComparisonPage component
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Audius vs {competitor.name}</h1>
      <p className="text-gray-600">Comparison data loaded: {comparisons.length} features</p>
      <pre className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto">
        {JSON.stringify(comparisons[0], null, 2)}
      </pre>
    </div>
  );
}
```

### 6.3 Create `app/[competitor]/page.tsx`

```typescript
// app/[competitor]/page.tsx
import { notFound } from 'next/navigation';
import { 
  getComparisonData, 
  getPlatform, 
  getCompetitors,
  getCompetitorSlugs,
  isValidCompetitor 
} from '@/lib/data';
import type { Metadata } from 'next';

// Static params for all competitors
export async function generateStaticParams() {
  return getCompetitorSlugs().map(slug => ({ competitor: slug }));
}

// Dynamic metadata
export async function generateMetadata({ 
  params 
}: { 
  params: { competitor: string } 
}): Promise<Metadata> {
  const competitor = getPlatform(params.competitor);
  if (!competitor) return {};
  
  return {
    title: `Audius vs ${competitor.name}`,
    description: `Compare Audius and ${competitor.name}. See streaming quality, features, and more.`,
  };
}

export default async function CompetitorPage({ 
  params 
}: { 
  params: { competitor: string } 
}) {
  if (!isValidCompetitor(params.competitor)) {
    notFound();
  }
  
  const competitor = getPlatform(params.competitor)!;
  const competitors = getCompetitors();
  const comparisons = getComparisonData(params.competitor);
  
  // TODO: Replace with ComparisonPage component
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Audius vs {competitor.name}</h1>
      <p className="text-gray-600">Comparison data loaded: {comparisons.length} features</p>
      <pre className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto">
        {JSON.stringify(comparisons[0], null, 2)}
      </pre>
    </div>
  );
}
```

### 6.4 Create `app/not-found.tsx`

```typescript
// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-gray-600 mb-8">Page not found</p>
      <Link 
        href="/"
        className="text-purple-600 hover:underline"
      >
        ← Back to comparison
      </Link>
    </div>
  );
}
```

---

## Verification Checklist

Before handing off to frontend:

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully  
- [ ] `npm run type-check` passes with no errors
- [ ] Visiting `http://localhost:3000` shows SoundCloud comparison stub
- [ ] Visiting `http://localhost:3000/spotify` shows Spotify comparison stub
- [ ] Visiting `http://localhost:3000/soundcloud` shows SoundCloud comparison stub
- [ ] Visiting `http://localhost:3000/invalid` shows 404 page
- [ ] `data/platforms.json` contains 3 platforms
- [ ] `data/features.json` contains 15 features (sorted)
- [ ] `data/comparisons.json` contains 45 comparisons
- [ ] All TypeScript imports resolve correctly

---

## Handoff Notes for Frontend

Once complete, notify frontend team that:

1. **Data is ready** in `data/*.json` - no API calls needed
2. **Types are defined** in `types/index.ts` - import and use directly
3. **Data utilities** in `lib/data.ts` - use `getComparisonData(slug)` to get page data
4. **Constants** in `lib/constants.ts` - all external URLs are here
5. **Routing works** - pages are stubbed, replace content with components
6. **Build passes** - TypeScript and build are clean

Frontend can immediately start building components without waiting for anything else.
