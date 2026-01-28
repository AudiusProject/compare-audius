# Audius Comparison Site - Project Plan

> **Last Updated:** January 27, 2026  
> **Status:** Planning Phase

---

## Related Documents

### Phase 1: Public Site (Complete)

| Document | Purpose | Audience |
|----------|---------|----------|
| [PLAN_BACKEND.md](./PLAN_BACKEND.md) | Project setup, data layer, types, utilities | Backend/IC Agent |
| [PLAN_QA_BACKEND.md](./PLAN_QA_BACKEND.md) | Verify backend before frontend starts | QA Agent (Gate Check) |
| [PLAN_FRONTEND.md](./PLAN_FRONTEND.md) | All UI components, styling, responsive design | Frontend/IC Agent |
| [PLAN_QA.md](./PLAN_QA.md) | Final testing, accessibility, performance, sign-off | QA/Review Agent |

### Phase 2: Admin Interface

| Document | Purpose | Audience |
|----------|---------|----------|
| [PROJECT_PLAN_ADMIN.md](./PROJECT_PLAN_ADMIN.md) | Admin UI, auth, database | All Agents |

**Execution Order:** 

```
Phase 1 (Complete):
Backend → Backend QA → Frontend → Final QA → Deploy

Phase 2 (Admin):
Database Setup → Auth → Admin UI → Admin QA → Deploy
```

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Requirements & Goals](#requirements--goals)
4. [Architecture Decisions](#architecture-decisions)
5. [Data Model](#data-model)
6. [Technical Implementation Plan](#technical-implementation-plan)
7. [Component Architecture](#component-architecture)
8. [Milestones & Phases](#milestones--phases)
9. [Open Questions & Decisions Needed](#open-questions--decisions-needed)
10. [Risk Assessment](#risk-assessment)

---

## Executive Summary

Rebuild the compare.audius.co product comparison website from Webflow to a modern, maintainable stack. The site compares Audius against competitors (currently SoundCloud and Spotify) across ~15 features.

**Key Objectives:**
- Improve maintainability and scalability
- Enable easy content updates without Webflow dependencies
- Match existing Figma designs for web and mobile
- Maintain SEO performance
- Reduce operational complexity

---

## Current State Analysis

### Existing Implementation (Webflow)

| Aspect | Current State | Issues |
|--------|--------------|--------|
| **Platform** | Webflow | Vendor lock-in, limited customization, CMS limitations |
| **Data** | Webflow CMS + CSV exports | Denormalized data, manual sync with Airtable |
| **Content** | 3 platforms, 15 features, 45 comparison records | Manageable size, unlikely to grow dramatically |
| **URLs** | `/` (landing), dynamic competitor routes | Simple routing structure |

### Data Structure (from CSV exports)

**Platforms (3 records):**
- Audius Music, Spotify, SoundCloud
- Fields: name, slug, logo URL, linked features/comparisons

**Features (15 records):**
- Streaming Quality, Unlimited Uploads, Ad-Free Interface, Ad-Free Listening, Comments, Direct Messages, Scheduled Releases, Offline Mode, Remix Features, Gated Content, Rewards System, Direct UGC Upload, Visualizer, Decentralized, Developer SDK
- Fields: name, slug, description, sort order

**Comparisons (45 records):**
- Junction table: Platform × Feature
- Fields: status (Yes/No/Partial/custom text), context (explanatory note)

### Design Assets (Figma)

| Layout | Node ID | Description |
|--------|---------|-------------|
| Web - SoundCloud | `1:2` | Desktop comparison table |
| Mobile - SoundCloud | `1:425` | Mobile stacked cards |
| Web - Spotify | `1:914` | Desktop comparison table |
| Mobile - Spotify | `1:1335` | Mobile stacked cards |

**Design Patterns Observed:**
- Fixed header with navigation (Compare dropdown, More dropdown, Open Audius CTA)
- Two-column comparison table (Audius always left)
- Status indicators: ✓ (green), ✗ (red), − (gray with context)
- Some features show values instead of status (e.g., "320 kbps")
- Alternating row backgrounds for readability
- Footer with social links and site navigation

---

## Requirements & Goals

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Display feature comparison between Audius and one competitor | Must Have |
| FR-2 | Support multiple competitors (SoundCloud, Spotify) | Must Have |
| FR-3 | Responsive design (mobile + desktop) | Must Have |
| FR-4 | Match Figma designs pixel-perfect | Should Have |
| FR-5 | Easy content updates (non-developer friendly) | Should Have |
| FR-6 | SEO-optimized pages with proper meta tags | Must Have |
| FR-7 | Fast page loads (< 2s LCP) | Must Have |
| FR-8 | Add new competitors without code changes | Nice to Have |
| FR-9 | Add new features without code changes | Nice to Have |

### Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | Lighthouse Performance Score | > 90 |
| NFR-2 | Lighthouse Accessibility Score | > 95 |
| NFR-3 | Time to First Byte | < 200ms |
| NFR-4 | Build time | < 60s |
| NFR-5 | Zero runtime dependencies on external services | Preferred |

### Out of Scope (Confirmed)

- [x] Multi-competitor comparison (3+ columns) — **Not doing**
- [x] CMS integration — **Not doing** (JSON files only)
- [x] Dark mode — **Not doing**
- [x] Analytics — **Not doing** for MVP
- [ ] User accounts or personalization
- [ ] Dynamic feature voting/feedback
- [ ] Internationalization (i18n)

---

## Architecture Decisions

### ADR-1: Framework Selection

**Decision:** Next.js 14+ with App Router

**Rationale:**
- Static Site Generation (SSG) for optimal performance
- File-based routing matches URL structure naturally
- TypeScript support out of the box
- Vercel deployment is trivial (Audius likely already uses Vercel)
- Large ecosystem and community support
- Future flexibility (API routes, ISR) if requirements evolve

**Alternatives Considered:**
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Astro | Faster builds, zero JS by default | Smaller ecosystem, less familiar | Good option, but Next.js more versatile |
| Remix | Great DX, nested routing | Overkill for static content | Rejected |
| Plain HTML/CSS | Simplest possible | No templating, manual duplication | Rejected |
| SvelteKit | Fast, small bundles | Team familiarity unknown | Rejected |

### ADR-2: Data Storage

**Decision:** Local JSON files with TypeScript types

**Rationale:**
- Content is small and stable (~15 features, ~3 competitors)
- Version controlled alongside code
- No external service dependencies
- Type-safe with generated TypeScript interfaces
- Easy migration path to CMS later if needed

**Data File Structure:**
```
/data
  /platforms.json      # Platform definitions
  /features.json       # Feature definitions  
  /comparisons.json    # Platform × Feature status
```

**Migration Path (if needed later):**
1. Abstract data access behind a `DataService` interface
2. Swap implementation from JSON to Contentful/Sanity/Airtable API
3. No component changes required

**Alternatives Considered:**
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Contentful | Great editor UX | Monthly cost, external dependency | Future option |
| Sanity | Flexible, good DX | Learning curve, external dependency | Future option |
| Airtable API | Already in use | Rate limits, runtime dependency | Rejected for MVP |
| MDX files | Rich content | Overkill for structured data | Rejected |
| SQLite/Turso | SQL queries | Unnecessary complexity | Rejected |

### ADR-3: Styling Approach

**Decision:** Tailwind CSS

**Rationale:**
- Rapid iteration matching Figma designs
- Consistent design tokens
- Excellent responsive utilities
- Small production bundle (purged CSS)
- Industry standard, easy to hire for

**Component Strategy:**
- Build custom components (not using shadcn/ui initially)
- Extract reusable primitives as needed
- CSS variables for brand colors

### ADR-4: Deployment

**Decision:** Vercel (recommended) or any static host

**Rationale:**
- Zero-config Next.js deployment
- Automatic preview deployments for PRs
- Edge network for fast global delivery
- Free tier sufficient for this traffic

**Alternatives:** Netlify, Cloudflare Pages, AWS Amplify (all viable)

---

## Data Model

### TypeScript Interfaces

```typescript
// types/index.ts

type ComparisonStatus = 'yes' | 'no' | 'partial' | 'custom';

interface Platform {
  id: string;
  name: string;
  slug: string;
  logo: string;           // URL or local path
  isAudius: boolean;      // Always show Audius on left
}

interface Feature {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
}

interface Comparison {
  id: string;
  platformId: string;
  featureId: string;
  status: ComparisonStatus;
  displayValue?: string;  // e.g., "320 kbps" for streaming quality
  context?: string;       // e.g., "Premium Subscription Required"
}

// Computed type for rendering
interface FeatureComparison {
  feature: Feature;
  audius: Comparison;
  competitor: Comparison;
}
```

### JSON Schema Example

```json
// data/platforms.json
[
  {
    "id": "audius",
    "name": "Audius",
    "slug": "audius",
    "logo": "/logos/audius.svg",
    "isAudius": true
  },
  {
    "id": "soundcloud",
    "name": "SoundCloud", 
    "slug": "soundcloud",
    "logo": "/logos/soundcloud.svg",
    "isAudius": false
  }
]
```

### Data Transformation

The existing CSV data will be transformed into the new JSON format during initial setup. A one-time migration script will:

1. Parse CSV files
2. Normalize Airtable record IDs to clean slugs
3. Generate TypeScript-compatible JSON
4. Validate data integrity (all comparisons have valid platform/feature refs)

---

## Technical Implementation Plan

### Project Structure

```
compare-audius/
├── app/
│   ├── layout.tsx              # Root layout (header/footer)
│   ├── page.tsx                # Renders default competitor (SoundCloud)
│   ├── [competitor]/
│   │   └── page.tsx            # Dynamic comparison page
│   ├── globals.css             # Global styles + Tailwind
│   └── favicon.ico
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── CompareDropdown.tsx       # Nav dropdown for competitor selection
│   │   └── MoreDropdown.tsx          # Nav dropdown for Blog/Help/Social
│   ├── comparison/
│   │   ├── ComparisonPage.tsx        # Page-level component
│   │   ├── PageHeader.tsx            # Title section with CompetitorSelector
│   │   ├── CompetitorSelector.tsx    # Inline dropdown (purple underline)
│   │   ├── ComparisonTable.tsx       # Desktop table view
│   │   ├── ComparisonCards.tsx       # Mobile card view
│   │   ├── FeatureRow.tsx            # Table row component
│   │   ├── FeatureCard.tsx           # Mobile card component
│   │   ├── StatusIndicator.tsx       # Yes/No/Partial icons
│   │   └── PlatformHeader.tsx        # Logo + name column header
│   └── ui/
│       ├── Button.tsx
│       ├── Dropdown.tsx              # Reusable dropdown primitive
│       └── Icon.tsx
├── data/
│   ├── platforms.json
│   ├── features.json
│   └── comparisons.json
├── lib/
│   ├── data.ts                 # Data loading utilities
│   ├── constants.ts            # External URLs, default competitor, etc.
│   └── utils.ts                # Helper functions
├── types/
│   └── index.ts                # TypeScript interfaces
├── public/
│   ├── logos/                  # Platform logos (WebP)
│   └── og-images/              # Open Graph images per competitor
├── scripts/
│   └── migrate-csv.ts          # One-time CSV → JSON migration
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

### Key Implementation Details

#### 1. Routing Strategy

**URL Structure:**
- `/` → Shows default competitor (SoundCloud) - same content as `/soundcloud`
- `/soundcloud` → Audius vs. SoundCloud comparison
- `/spotify` → Audius vs. Spotify comparison

**Why not redirect `/` to `/soundcloud`?**
- Cleaner URL for sharing/marketing
- Avoids unnecessary redirect latency
- The root URL is the canonical "home" of the comparison site

```typescript
// app/page.tsx (root)
import { DEFAULT_COMPETITOR } from '@/lib/constants';

export default async function HomePage() {
  const comparisons = await getComparisonData(DEFAULT_COMPETITOR);
  return <ComparisonPage data={comparisons} competitor={DEFAULT_COMPETITOR} />;
}

// app/[competitor]/page.tsx (dynamic routes)
export async function generateStaticParams() {
  const platforms = await getPlatforms();
  return platforms
    .filter(p => !p.isAudius)
    .map(p => ({ competitor: p.slug }));
}

export default async function CompetitorPage({ 
  params 
}: { 
  params: { competitor: string } 
}) {
  const comparisons = await getComparisonData(params.competitor);
  return <ComparisonPage data={comparisons} competitor={params.competitor} />;
}
```

#### 2. Responsive Design Strategy

| Breakpoint | Layout | Component |
|------------|--------|-----------|
| < 768px | Stacked cards | `ComparisonCards` |
| ≥ 768px | Two-column table | `ComparisonTable` |

```typescript
// components/comparison/ComparisonView.tsx

export function ComparisonView({ data }: Props) {
  return (
    <>
      {/* Mobile: Cards */}
      <div className="md:hidden">
        <ComparisonCards data={data} />
      </div>
      
      {/* Desktop: Table */}
      <div className="hidden md:block">
        <ComparisonTable data={data} />
      </div>
    </>
  );
}
```

#### 3. SEO Implementation

```typescript
// app/[competitor]/page.tsx

export async function generateMetadata({ params }): Promise<Metadata> {
  const competitor = await getPlatform(params.competitor);
  
  return {
    title: `Audius vs ${competitor.name} | Compare Features`,
    description: `See how Audius compares to ${competitor.name}. Compare streaming quality, features, and more.`,
    openGraph: {
      title: `Audius vs ${competitor.name}`,
      description: `Feature comparison between Audius and ${competitor.name}`,
      images: [`/og-images/${params.competitor}.png`],
    },
  };
}
```

---

## Component Architecture

### Component Hierarchy

```
App
└── RootLayout
    ├── Header
    │   ├── Logo
    │   ├── Navigation
    │   │   ├── CompareDropdown (competitor selector)
    │   │   │   └── "Audius vs. Spotify" | "Audius vs. SoundCloud"
    │   │   └── MoreDropdown
    │   │       └── "Read The Blog" | "Help Center" | "Follow Us" (social icons)
    │   └── CTAButton ("Open Audius")
    ├── Main Content
    │   └── ComparisonPage
    │       ├── PageHeader
    │       │   ├── "Compare" badge
    │       │   ├── Title: "Audius vs."
    │       │   ├── CompetitorSelector (inline dropdown, purple dotted underline)
    │       │   │   └── Dropdown with competitor options
    │       │   └── Subtitle
    │       └── ComparisonView
    │           ├── ComparisonTable (desktop)
    │           │   ├── PlatformHeader × 2
    │           │   └── FeatureRow × n
    │           │       └── StatusIndicator × 2
    │           └── ComparisonCards (mobile)
    │               └── FeatureCard × n
    │                   └── StatusIndicator × 2
    └── Footer
        ├── SocialLinks
        └── FooterNav
```

### Competitor Selection UX

There are **two ways** to switch competitors:

1. **Header Navigation Dropdown** ("Compare" menu)
   - Standard dropdown in the top nav
   - Lists all "Audius vs. X" options
   - Full page navigation on selection

2. **Inline Page Header Dropdown** (CompetitorSelector)
   - The competitor name in "Audius vs. **SoundCloud**" is interactive
   - Purple dotted underline indicates clickability
   - Clicking opens a dropdown to switch competitors
   - Should feel native/seamless (client-side navigation preferred here)

### Component Specifications

#### StatusIndicator

| Status | Icon | Color | Text |
|--------|------|-------|------|
| yes | Checkmark | `#1FDF64` (green) | None |
| no | X | `#FF4444` (red) | None |
| partial | Dash | `#999999` (gray) | Context text below |
| custom | None | `#666666` | Display value (e.g., "320 kbps") |

#### CompetitorSelector (Inline Dropdown)

**Visual Design:**
- Competitor name displayed as heading text
- Purple dotted underline indicates interactivity
- Dropdown caret icon (optional, check Figma)
- On hover: cursor pointer, slight color shift

**Behavior:**
- Click opens dropdown with competitor options
- Selecting a competitor navigates to that route
- Uses Next.js `useRouter` for client-side navigation (smoother UX)
- Dropdown closes on selection or outside click

**Accessibility:**
- `role="listbox"` for dropdown
- `aria-expanded` state
- Keyboard navigation (arrow keys, Enter, Escape)

#### Dropdown (Reusable Primitive)

Both `CompareDropdown`, `MoreDropdown`, and `CompetitorSelector` share a common dropdown primitive:

```typescript
interface DropdownProps {
  trigger: React.ReactNode;           // Button/link that opens dropdown
  items: DropdownItem[];              // Menu items
  align?: 'left' | 'right' | 'center'; // Alignment relative to trigger
  onSelect?: (item: DropdownItem) => void;
}

interface DropdownItem {
  id: string;
  label: string;
  href?: string;                      // For navigation items
  icon?: React.ReactNode;             // For social links
  onClick?: () => void;               // For action items
}
```

---

## Milestones & Phases

### Phase 1: Foundation
- [ ] Project setup (Next.js 14+, TypeScript, Tailwind)
- [ ] Data migration script (CSV → JSON)
- [ ] TypeScript type definitions
- [ ] Basic routing (`/`, `/[competitor]`)
- [ ] Data loading utilities (`lib/data.ts`)
- [ ] Constants file (external URLs, default competitor)

### Phase 2: Layout Components
- [ ] Header component (logo, nav structure)
- [ ] Footer component (social links, nav)
- [ ] Dropdown primitive (`ui/Dropdown.tsx`)
- [ ] CompareDropdown (competitor selection in nav)
- [ ] MoreDropdown (Blog, Help Center, Social links)

### Phase 3: Comparison - Desktop
- [ ] PageHeader component (badge, title, subtitle)
- [ ] CompetitorSelector (inline dropdown with purple underline)
- [ ] PlatformHeader component (logo + name)
- [ ] StatusIndicator component (checkmark/X/dash + context)
- [ ] FeatureRow component
- [ ] ComparisonTable component (assembles rows)

### Phase 4: Comparison - Mobile
- [ ] FeatureCard component (mobile layout)
- [ ] ComparisonCards component (assembles cards)
- [ ] Mobile navigation (hamburger menu if needed)
- [ ] Responsive breakpoint testing

### Phase 5: Polish & SEO
- [ ] Design polish (spacing, typography, colors from Figma)
- [ ] Meta tags and Open Graph images
- [ ] Favicon and app icons
- [ ] Accessibility audit (keyboard nav, ARIA)
- [ ] Lighthouse performance audit

### Phase 6: Deployment & Launch
- [ ] Vercel project setup
- [ ] Environment configuration
- [ ] DNS configuration (compare.audius.co)
- [ ] Cross-browser testing
- [ ] Smoke testing all routes
- [ ] Launch

### Post-Launch (Future)
- [ ] Analytics integration (when needed)
- [ ] Additional competitors (when needed)
- [ ] Performance monitoring

---

## Decisions Log

All key decisions have been finalized.

### Resolved Decisions

| # | Question | Decision | Notes |
|---|----------|----------|-------|
| 1 | **Landing page behavior** | Show default competitor comparison | `/` displays comparison page (default: SoundCloud) |
| 2 | **Competitor switching** | Two interaction points | Nav dropdown + inline dropdown on competitor name (purple dotted underline = interactive) |
| 3 | **Logo assets** | Use WebP from CDN | No SVG available, WebP is acceptable |
| 4 | **"Compare" dropdown contents** | Competitor links | "Audius vs. Spotify", "Audius vs. SoundCloud" |
| 5 | **"More" dropdown contents** | Blog, Help, Social | "Read The Blog", "Help Center", "Follow Us" (social links) |
| 6 | **Analytics** | None for MVP | Can add later if needed |
| 7 | **CMS** | No - JSON files only | Keep it simple, version controlled |
| 8 | **Multi-competitor view** | No - 1v1 only | Single competitor comparison per page |
| 9 | **Dark mode** | No | Not in scope |

### Remaining Items to Verify During Implementation

| # | Item | Status |
|---|------|--------|
| 1 | Footer link URLs | Verify all are functional |
| 2 | Brand color hex values | Extract from Figma during implementation |

### Confirmed Constants

```typescript
// lib/constants.ts
export const DEFAULT_COMPETITOR = 'soundcloud';
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Design changes during development | Medium | Medium | Get Figma sign-off before Phase 2 |
| Logo/asset availability delays | Medium | Low | Use placeholder images, swap later |
| SEO ranking loss during migration | Low | High | Maintain URL structure, proper redirects, submit to Search Console |
| Performance issues on mobile | Low | Medium | Mobile-first development, regular Lighthouse checks |
| Scope creep (new features) | Medium | Medium | Strict MVP definition, defer to Phase 6 |

---

## Implementation Guide

This section contains detailed specifications for developers implementing the project.

### External URLs Reference

```typescript
// lib/constants.ts

export const DEFAULT_COMPETITOR = 'soundcloud';

export const EXTERNAL_URLS = {
  // Main Audius
  audiusApp: 'https://audius.co',
  audiusMusic: 'https://audius.co/trending',
  
  // Navigation - More dropdown
  blog: 'https://blog.audius.co',
  helpCenter: 'https://support.audius.co',
  
  // Social Links (Footer + More dropdown)
  instagram: 'https://instagram.com/audiusmusic',
  twitter: 'https://twitter.com/audaboringworld',
  discord: 'https://discord.gg/audius',
  telegram: 'https://t.me/audius',
  
  // Footer Links
  download: 'https://audius.co/download',
  events: 'https://audius.co/events',
  merchStore: 'https://store.audius.co',
  brandPress: 'https://audius.co/brand',
  engineering: 'https://audius.co/engineering',
  openAudioFoundation: 'https://openaudius.org',
  termsOfService: 'https://audius.co/legal/terms-of-use',
  privacyPolicy: 'https://audius.co/legal/privacy-policy',
} as const;

// NOTE: Verify all URLs are correct before launch. Some may have changed.
```

### Platform Logo URLs

From the existing Webflow CDN (use these directly, no need to self-host):

```typescript
export const PLATFORM_LOGOS = {
  audius: 'https://cdn.prod.website-files.com/67fec1eb88ef3de9adf4455c/6802c1954e5d6fc2ec61ccd4_y7vxxCf97wWfwEsRoz9xpn3cAsel2_X60gFP4PQnzF8.webp',
  spotify: 'https://cdn.prod.website-files.com/67fec1eb88ef3de9adf4455c/6802c198cf8d0609b1efe254_IWZ1lcJOvgM44SvoFDAxhQ-SzNN_BD4-A5T-0sYEm_8.webp',
  soundcloud: 'https://cdn.prod.website-files.com/67fec1eb88ef3de9adf4455c/6802c19b087bc55f9a37532b_TPcZC0fpDh--_HWFgLXPejJrU1quvQu3jfh9SUzg83U.webp',
} as const;
```

### Data Migration Script

The CSV files need to be transformed into clean JSON. Here's the transformation logic:

```typescript
// scripts/migrate-csv.ts

/**
 * CSV → JSON Migration
 * 
 * Input: webflow-csv-data/*.csv
 * Output: data/*.json
 * 
 * Key transformations:
 * 1. Strip Webflow metadata columns (Collection ID, Locale ID, Item ID, etc.)
 * 2. Convert Airtable Record IDs to clean slugs where possible
 * 3. Normalize status values: "Yes" → "yes", "No" → "no", "Partial" → "partial"
 * 4. Extract custom display values (e.g., "320 kbps" from Context field)
 * 5. Validate referential integrity (all comparisons reference valid platforms/features)
 */

// Parsing notes for Comparisons.csv:
// - "Unique Semantic Name" format: "[Platform Name] Feature Name" 
//   e.g., "[Audius Music] Streaming Quality"
// - "Linked Platform" contains the platform slug (audiusmusic, spotify, soundcloud)
// - "Linked Feature" contains the Airtable Record ID → need to map to feature slug
// - "Status" values: "Yes", "No", "Partial", or empty (for custom values)
// - "Context" contains either:
//   - Explanation text for "Partial" status (e.g., "Premium Subscription Required")
//   - Display value for empty Status (e.g., "320 kbps", "128 kbps")

// Platform slug normalization:
const PLATFORM_SLUG_MAP = {
  'audiusmusic': 'audius',  // Normalize to cleaner slug
  'spotify': 'spotify',
  'soundcloud': 'soundcloud',
};
```

**Expected Output Structure:**

```json
// data/platforms.json
[
  {
    "id": "audius",
    "name": "Audius",
    "slug": "audius",
    "logo": "https://cdn.prod.website-files.com/...",
    "isAudius": true
  },
  {
    "id": "soundcloud",
    "name": "SoundCloud",
    "slug": "soundcloud", 
    "logo": "https://cdn.prod.website-files.com/...",
    "isAudius": false
  },
  {
    "id": "spotify",
    "name": "Spotify",
    "slug": "spotify",
    "logo": "https://cdn.prod.website-files.com/...",
    "isAudius": false
  }
]
```

```json
// data/features.json
[
  {
    "id": "streaming-quality",
    "name": "Streaming Quality",
    "slug": "streaming-quality",
    "description": "Max streaming audio bitrate offered on free tier.",
    "sortOrder": 1
  },
  // ... etc, ordered by sortOrder
]
```

```json
// data/comparisons.json
[
  {
    "id": "audius-streaming-quality",
    "platformId": "audius",
    "featureId": "streaming-quality",
    "status": "custom",
    "displayValue": "320 kbps",
    "context": null
  },
  {
    "id": "soundcloud-streaming-quality",
    "platformId": "soundcloud",
    "featureId": "streaming-quality",
    "status": "custom",
    "displayValue": "128 kbps",
    "context": null
  },
  {
    "id": "soundcloud-unlimited-uploads",
    "platformId": "soundcloud",
    "featureId": "unlimited-uploads",
    "status": "partial",
    "displayValue": null,
    "context": "Premium Subscription Required"
  },
  // ... etc
]
```

### Data Loading Utilities

```typescript
// lib/data.ts

import platforms from '@/data/platforms.json';
import features from '@/data/features.json';
import comparisons from '@/data/comparisons.json';
import type { Platform, Feature, Comparison, FeatureComparison } from '@/types';

export function getPlatforms(): Platform[] {
  return platforms as Platform[];
}

export function getPlatform(slug: string): Platform | undefined {
  return platforms.find(p => p.slug === slug) as Platform | undefined;
}

export function getCompetitors(): Platform[] {
  return platforms.filter(p => !p.isAudius) as Platform[];
}

export function getFeatures(): Feature[] {
  return (features as Feature[]).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getComparisonData(competitorSlug: string): FeatureComparison[] {
  const audius = platforms.find(p => p.isAudius) as Platform;
  const competitor = platforms.find(p => p.slug === competitorSlug) as Platform;
  
  if (!competitor) {
    throw new Error(`Unknown competitor: ${competitorSlug}`);
  }
  
  const featureList = getFeatures();
  
  return featureList.map(feature => {
    const audiusComparison = comparisons.find(
      c => c.platformId === audius.id && c.featureId === feature.id
    ) as Comparison;
    
    const competitorComparison = comparisons.find(
      c => c.platformId === competitor.id && c.featureId === feature.id
    ) as Comparison;
    
    return {
      feature,
      audius: audiusComparison,
      competitor: competitorComparison,
    };
  });
}

export function isValidCompetitor(slug: string): boolean {
  return getCompetitors().some(c => c.slug === slug);
}
```

### Component Implementation Notes

#### Header.tsx

```typescript
/**
 * Fixed header with:
 * - Audius logo (links to audius.co)
 * - CompareDropdown ("Compare" with chevron)
 * - MoreDropdown ("More" with chevron)  
 * - CTA button ("Open Audius" - links to audius.co)
 * 
 * Mobile: Hamburger menu that expands to show all nav items
 * Desktop: Horizontal nav layout
 * 
 * The header should NOT be sticky/fixed - it scrolls with page (check Figma)
 */
```

#### CompetitorSelector.tsx

```typescript
/**
 * Inline dropdown embedded in the page title.
 * 
 * Renders: "Audius vs. [SoundCloud ▾]"
 * Where [SoundCloud ▾] is the interactive dropdown trigger.
 * 
 * Visual requirements:
 * - Purple dotted underline on the competitor name
 * - Text should match heading size/weight
 * - Dropdown arrow/chevron after the name
 * 
 * Behavior:
 * - Click opens dropdown listing all competitors
 * - Selection triggers Next.js router.push() for client-side nav
 * - Close dropdown on: selection, outside click, Escape key
 * 
 * Props:
 * - currentCompetitor: Platform
 * - competitors: Platform[]
 */

// Example structure:
<h1>
  Audius vs.{' '}
  <CompetitorSelector 
    current={competitor} 
    options={competitors}
  />
</h1>
```

#### StatusIndicator.tsx

```typescript
/**
 * Displays the comparison status for a feature.
 * 
 * Four visual states:
 * 
 * 1. status="yes"
 *    - Green circle with white checkmark
 *    - No additional text
 * 
 * 2. status="no" 
 *    - Red circle with white X
 *    - No additional text
 * 
 * 3. status="partial"
 *    - Gray circle with white dash/minus
 *    - Context text displayed below in smaller gray text
 *    - e.g., "Premium Subscription Required"
 * 
 * 4. status="custom"
 *    - No icon
 *    - Display the displayValue as text
 *    - e.g., "320 kbps"
 * 
 * Props:
 * - status: 'yes' | 'no' | 'partial' | 'custom'
 * - displayValue?: string
 * - context?: string
 */
```

#### FeatureRow.tsx (Desktop)

```typescript
/**
 * Single row in the comparison table.
 * 
 * Layout (3 columns):
 * | Feature Info        | Audius Status    | Competitor Status |
 * | [Name]              | [StatusIndicator]| [StatusIndicator] |
 * | [Description]       |                  |                   |
 * 
 * Visual notes:
 * - Alternating row backgrounds (check Figma for exact colors)
 * - Feature name is bold/semibold
 * - Description is smaller, gray text
 * - Status indicators are centered in their columns
 * - Adequate padding for readability
 */
```

#### FeatureCard.tsx (Mobile)

```typescript
/**
 * Mobile card showing one feature comparison.
 * 
 * Layout (stacked):
 * ┌─────────────────────────────────┐
 * │ Feature Name                    │
 * │ Feature Description             │
 * ├─────────────────────────────────┤
 * │ [Audius Logo]                   │
 * │ [StatusIndicator]               │
 * ├─────────────────────────────────┤
 * │ [Competitor Logo]               │
 * │ [StatusIndicator]               │
 * └─────────────────────────────────┘
 * 
 * Each platform section shows:
 * - Platform logo (smaller than desktop)
 * - Status indicator below logo
 */
```

### Error Handling

```typescript
// app/[competitor]/page.tsx

import { notFound } from 'next/navigation';
import { isValidCompetitor } from '@/lib/data';

export default async function CompetitorPage({ params }) {
  // Validate the competitor slug
  if (!isValidCompetitor(params.competitor)) {
    notFound(); // Returns 404 page
  }
  
  // ... rest of implementation
}
```

```typescript
// app/not-found.tsx

/**
 * Custom 404 page
 * 
 * Should display:
 * - Friendly message
 * - Link back to home (default comparison)
 * - Maintain header/footer layout
 */
```

### Tailwind Configuration

```typescript
// tailwind.config.ts

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors - extract exact values from Figma
        audius: {
          purple: '#7E1BCC',
          'purple-light': '#B749E0',
        },
        status: {
          yes: '#1FDF64',      // Green checkmark
          no: '#FF4444',       // Red X
          partial: '#999999',  // Gray dash
        },
      },
      fontFamily: {
        // Check Figma for exact font family
        // Likely: Inter, Avenir, or custom Audius font
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderStyle: {
        'dotted-purple': 'dotted', // For CompetitorSelector underline
      },
    },
  },
  plugins: [],
};

export default config;
```

### Testing Checklist

Before considering each phase complete, verify:

**Phase 1 (Foundation):**
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully
- [ ] TypeScript has no errors (`npm run type-check`)
- [ ] JSON data files are valid and load correctly
- [ ] All platform/feature/comparison relationships are intact

**Phase 2-4 (Components):**
- [ ] Each component renders without errors
- [ ] Desktop layout matches Figma at 1440px width
- [ ] Mobile layout matches Figma at 375px width
- [ ] All links navigate to correct destinations
- [ ] Dropdowns open/close correctly
- [ ] CompetitorSelector navigates between competitors
- [ ] Keyboard navigation works (Tab, Enter, Escape)

**Phase 5 (Polish & SEO):**
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 95
- [ ] All meta tags render correctly (check with og:image validators)
- [ ] No console errors or warnings
- [ ] Favicon displays correctly

**Phase 6 (Deployment):**
- [ ] Production build runs locally (`npm run build && npm start`)
- [ ] All routes work: `/`, `/soundcloud`, `/spotify`
- [ ] Invalid routes show 404 page
- [ ] External links open in new tabs
- [ ] Site works in Chrome, Firefox, Safari
- [ ] Site works on iOS Safari and Android Chrome

### Page-Level Implementation

```typescript
// app/layout.tsx
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

export const metadata = {
  title: {
    default: 'Audius vs The Industry | Compare Features',
    template: '%s | Audius Compare',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

```typescript
// app/page.tsx (root - shows SoundCloud by default)
import { ComparisonPage } from '@/components/comparison/ComparisonPage';
import { getComparisonData, getPlatform, getCompetitors } from '@/lib/data';
import { DEFAULT_COMPETITOR } from '@/lib/constants';

export default async function HomePage() {
  const competitor = getPlatform(DEFAULT_COMPETITOR)!;
  const competitors = getCompetitors();
  const data = getComparisonData(DEFAULT_COMPETITOR);
  
  return (
    <ComparisonPage 
      competitor={competitor}
      competitors={competitors}
      comparisons={data}
    />
  );
}
```

```typescript
// app/[competitor]/page.tsx
import { notFound } from 'next/navigation';
import { ComparisonPage } from '@/components/comparison/ComparisonPage';
import { 
  getComparisonData, 
  getPlatform, 
  getCompetitors,
  isValidCompetitor 
} from '@/lib/data';
import type { Metadata } from 'next';

// Generate static pages for all competitors at build time
export async function generateStaticParams() {
  const competitors = getCompetitors();
  return competitors.map(c => ({ competitor: c.slug }));
}

// Dynamic metadata per competitor
export async function generateMetadata({ params }): Promise<Metadata> {
  const competitor = getPlatform(params.competitor);
  if (!competitor) return {};
  
  return {
    title: `Audius vs ${competitor.name}`,
    description: `Compare Audius and ${competitor.name}. See streaming quality, features, and more.`,
    openGraph: {
      title: `Audius vs ${competitor.name}`,
      description: `Feature-by-feature comparison between Audius and ${competitor.name}`,
      url: `https://compare.audius.co/${params.competitor}`,
    },
  };
}

export default async function CompetitorPage({ 
  params 
}: { 
  params: { competitor: string } 
}) {
  // 404 for invalid competitors
  if (!isValidCompetitor(params.competitor)) {
    notFound();
  }
  
  const competitor = getPlatform(params.competitor)!;
  const competitors = getCompetitors();
  const data = getComparisonData(params.competitor);
  
  return (
    <ComparisonPage 
      competitor={competitor}
      competitors={competitors}
      comparisons={data}
    />
  );
}
```

```typescript
// components/comparison/ComparisonPage.tsx
'use client';

import { PageHeader } from './PageHeader';
import { ComparisonTable } from './ComparisonTable';
import { ComparisonCards } from './ComparisonCards';
import type { Platform, FeatureComparison } from '@/types';

interface Props {
  competitor: Platform;
  competitors: Platform[];
  comparisons: FeatureComparison[];
}

export function ComparisonPage({ competitor, competitors, comparisons }: Props) {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        competitor={competitor}
        competitors={competitors}
      />
      
      {/* Desktop view */}
      <div className="hidden md:block">
        <ComparisonTable 
          competitor={competitor}
          comparisons={comparisons}
        />
      </div>
      
      {/* Mobile view */}
      <div className="md:hidden">
        <ComparisonCards 
          competitor={competitor}
          comparisons={comparisons}
        />
      </div>
    </div>
  );
}
```

### Figma Reference Quick Links

| Design | URL |
|--------|-----|
| Web - SoundCloud | https://www.figma.com/design/00i0TtJXSpNoT3tqKvbp6O/Compare.audius?node-id=1-2 |
| Mobile - SoundCloud | https://www.figma.com/design/00i0TtJXSpNoT3tqKvbp6O/Compare.audius?node-id=1-425 |
| Web - Spotify | https://www.figma.com/design/00i0TtJXSpNoT3tqKvbp6O/Compare.audius?node-id=1-914 |
| Mobile - Spotify | https://www.figma.com/design/00i0TtJXSpNoT3tqKvbp6O/Compare.audius?node-id=1-1335 |

Use Figma Dev Mode to extract exact:
- Colors (hex values)
- Font sizes, weights, line heights
- Spacing (padding, margins, gaps)
- Border radii
- Shadow values (if any)

---

## Appendix

### A. Color Palette (to be confirmed)

```css
:root {
  /* Brand Colors */
  --color-audius-purple: #7E1BCC;
  --color-audius-gradient-start: #7E1BCC;
  --color-audius-gradient-end: #B749E0;
  
  /* Status Colors */
  --color-status-yes: #1FDF64;
  --color-status-no: #FF4444;
  --color-status-partial: #999999;
  
  /* Neutral Colors */
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #666666;
  --color-background: #FFFFFF;
  --color-surface: #F5F5F5;
  --color-border: #E5E5E5;
}
```

### B. External Links

- Figma: https://www.figma.com/design/00i0TtJXSpNoT3tqKvbp6O/Compare.audius
- Current Site: https://compare.audius.co
- Audius Main: https://audius.co

### C. Reference Commands

```bash
# Create project
npx create-next-app@latest compare-audius --typescript --tailwind --app --src-dir=false

# Run development server
npm run dev

# Build for production
npm run build

# Run migration script
npx tsx scripts/migrate-csv.ts
```

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-27 | AI Assistant | Initial plan created |
| 2026-01-27 | AI Assistant | Finalized all open decisions: routing, competitor selector UX, dropdown contents, WebP logos, no analytics/CMS/dark mode |
| 2026-01-27 | AI Assistant | Added Implementation Guide: external URLs, logo URLs, data migration script details, component implementation notes, error handling, Tailwind config, testing checklist, Figma quick links |
| 2026-01-27 | AI Assistant | Split into separate PLAN_BACKEND.md and PLAN_FRONTEND.md for parallel agent execution |
| 2026-01-27 | AI Assistant | Added PLAN_QA.md for QA/Review agent with comprehensive testing checklists |
| 2026-01-27 | AI Assistant | Added PLAN_QA_BACKEND.md as gate check between backend and frontend phases |
