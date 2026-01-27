# Backend QA & Verification Plan

> **Parent Document:** [PROJECT_PLAN.md](./PROJECT_PLAN.md)  
> **Scope:** Verify backend/data layer is complete and correct before frontend begins  
> **Depends On:** [PLAN_BACKEND.md](./PLAN_BACKEND.md) complete  
> **Blocks:** [PLAN_FRONTEND.md](./PLAN_FRONTEND.md) cannot start until this passes

---

## Overview

This is a gate check between backend and frontend work. The frontend agent should not start until all items in this plan pass. This ensures the data layer is solid before building UI on top of it.

---

## Quick Verification Commands

Run these first - if any fail, backend is incomplete:

```bash
# 1. Dev server starts
npm run dev

# 2. Build passes
npm run build

# 3. TypeScript passes
npm run type-check

# 4. Data files exist
ls -la data/
```

**Expected output for `ls -la data/`:**
```
platforms.json
features.json
comparisons.json
```

---

## 1. Project Structure Verification

### 1.1 Required Files Exist

| File | Purpose | Exists |
|------|---------|--------|
| `package.json` | Dependencies and scripts | [ ] |
| `tsconfig.json` | TypeScript config | [ ] |
| `tailwind.config.ts` | Tailwind config | [ ] |
| `next.config.ts` or `next.config.js` | Next.js config | [ ] |
| `app/layout.tsx` | Root layout | [ ] |
| `app/page.tsx` | Home page | [ ] |
| `app/[competitor]/page.tsx` | Dynamic competitor page | [ ] |
| `app/not-found.tsx` | 404 page | [ ] |
| `app/globals.css` | Global styles | [ ] |
| `types/index.ts` | Type definitions | [ ] |
| `lib/data.ts` | Data utilities | [ ] |
| `lib/constants.ts` | Constants and URLs | [ ] |
| `lib/utils.ts` | Helper utilities | [ ] |
| `data/platforms.json` | Platform data | [ ] |
| `data/features.json` | Feature data | [ ] |
| `data/comparisons.json` | Comparison data | [ ] |

### 1.2 Required Directories Exist

| Directory | Purpose | Exists |
|-----------|---------|--------|
| `app/` | Next.js app router | [ ] |
| `app/[competitor]/` | Dynamic route | [ ] |
| `components/` | Component directory (can be empty) | [ ] |
| `components/layout/` | Layout components | [ ] |
| `components/comparison/` | Comparison components | [ ] |
| `components/ui/` | UI primitives | [ ] |
| `data/` | JSON data files | [ ] |
| `lib/` | Utilities | [ ] |
| `types/` | TypeScript types | [ ] |

---

## 2. Type Definitions Verification

### 2.1 Check `types/index.ts` exports

```typescript
// All these types should be exported:
import type { 
  ComparisonStatus,
  Platform,
  Feature,
  Comparison,
  FeatureComparison,
  ComparisonPageProps  // Optional but helpful
} from '@/types';
```

| Type | Exported | Correct Shape |
|------|----------|---------------|
| `ComparisonStatus` | [ ] | `'yes' \| 'no' \| 'partial' \| 'custom'` |
| `Platform` | [ ] | `{ id, name, slug, logo, isAudius }` |
| `Feature` | [ ] | `{ id, name, slug, description, sortOrder }` |
| `Comparison` | [ ] | `{ id, platformId, featureId, status, displayValue, context }` |
| `FeatureComparison` | [ ] | `{ feature, audius, competitor }` |

### 2.2 Type Correctness Test

Create a temporary test file to verify types compile:

```typescript
// test-types.ts (delete after verification)
import type { Platform, Feature, Comparison, FeatureComparison, ComparisonStatus } from '@/types';

const status: ComparisonStatus = 'yes'; // Should compile
const platform: Platform = {
  id: 'test',
  name: 'Test',
  slug: 'test',
  logo: 'https://example.com/logo.png',
  isAudius: false,
};

// If this file compiles with `npx tsc --noEmit`, types are correct
```

---

## 3. Data Files Verification

### 3.1 `data/platforms.json`

**Record count:** Must be exactly 3

| Check | Expected | Actual | Pass |
|-------|----------|--------|------|
| Total records | 3 | | [ ] |
| Has Audius | Yes | | [ ] |
| Has SoundCloud | Yes | | [ ] |
| Has Spotify | Yes | | [ ] |

**Field verification for each platform:**

| Platform | id | slug | isAudius | logo (non-empty) |
|----------|-----|------|----------|------------------|
| Audius | `audius` | `audius` | `true` | [ ] |
| SoundCloud | `soundcloud` | `soundcloud` | `false` | [ ] |
| Spotify | `spotify` | `spotify` | `false` | [ ] |

**Critical:** Slug must be `audius`, NOT `audiusmusic`

### 3.2 `data/features.json`

**Record count:** Must be exactly 15

| Check | Expected | Actual | Pass |
|-------|----------|--------|------|
| Total records | 15 | | [ ] |
| All have sortOrder | Yes | | [ ] |
| Sorted by sortOrder | Yes | | [ ] |

**Required features (verify all present):**

| # | Feature Name | Has Description | sortOrder |
|---|--------------|-----------------|-----------|
| 1 | Streaming Quality | [ ] | 1 |
| 2 | Unlimited Uploads | [ ] | 2 |
| 3 | Ad-Free Interface | [ ] | 3 |
| 4 | Ad-Free Listening | [ ] | 4 |
| 5 | Comments | [ ] | 5 |
| 6 | Direct Messages | [ ] | 6 |
| 7 | Scheduled Releases | [ ] | 7 |
| 8 | Offline Mode | [ ] | 8 |
| 9 | Remix Features | [ ] | 9 |
| 10 | Gated Content | [ ] | 10 |
| 11 | Rewards System | [ ] | 11 |
| 12 | Direct UGC Upload | [ ] | 12 |
| 13 | Visualizer | [ ] | 13 |
| 14 | Decentralized | [ ] | 14 |
| 15 | Developer SDK | [ ] | 15 |

### 3.3 `data/comparisons.json`

**Record count:** Must be exactly 45 (3 platforms × 15 features)

| Check | Expected | Actual | Pass |
|-------|----------|--------|------|
| Total records | 45 | | [ ] |
| Audius comparisons | 15 | | [ ] |
| SoundCloud comparisons | 15 | | [ ] |
| Spotify comparisons | 15 | | [ ] |

**Status value verification:**

| Check | Pass |
|-------|------|
| All status values are lowercase | [ ] |
| Only valid values: `yes`, `no`, `partial`, `custom` | [ ] |
| `partial` records have `context` populated | [ ] |
| `custom` records have `displayValue` populated | [ ] |

**Specific record spot-checks:**

| Platform | Feature | Expected Status | Expected Value/Context | Pass |
|----------|---------|-----------------|------------------------|------|
| audius | streaming-quality | `custom` | displayValue: "320 kbps" | [ ] |
| soundcloud | streaming-quality | `custom` | displayValue: "128 kbps" | [ ] |
| spotify | streaming-quality | `custom` | displayValue: "160 kbps" | [ ] |
| audius | unlimited-uploads | `yes` | - | [ ] |
| soundcloud | unlimited-uploads | `partial` | context: "Premium Subscription Required" | [ ] |
| spotify | unlimited-uploads | `no` | - | [ ] |
| audius | decentralized | `yes` | - | [ ] |
| soundcloud | decentralized | `no` | - | [ ] |
| spotify | decentralized | `no` | - | [ ] |
| audius | ad-free-interface | `yes` | - | [ ] |
| soundcloud | ad-free-interface | `partial` | context present | [ ] |
| spotify | ad-free-interface | `partial` | context present | [ ] |

### 3.4 Referential Integrity

Every comparison must reference valid platform and feature IDs:

```bash
# Quick validation (run in Node or as script)
node -e "
const platforms = require('./data/platforms.json');
const features = require('./data/features.json');
const comparisons = require('./data/comparisons.json');

const platformIds = new Set(platforms.map(p => p.id));
const featureIds = new Set(features.map(f => f.id));

let errors = 0;
comparisons.forEach(c => {
  if (!platformIds.has(c.platformId)) {
    console.error('Invalid platform:', c.platformId, 'in', c.id);
    errors++;
  }
  if (!featureIds.has(c.featureId)) {
    console.error('Invalid feature:', c.featureId, 'in', c.id);
    errors++;
  }
});

console.log(errors === 0 ? '✓ All references valid' : '✗ Found ' + errors + ' errors');
process.exit(errors > 0 ? 1 : 0);
"
```

| Check | Pass |
|-------|------|
| All platformId references valid | [ ] |
| All featureId references valid | [ ] |

---

## 4. Data Utilities Verification

### 4.1 Check `lib/data.ts` exports

```typescript
// All these functions should be exported:
import { 
  getPlatforms,
  getPlatform,
  getAudius,
  getCompetitors,
  getFeatures,
  getFeature,
  getComparison,
  getComparisonData,
  isValidCompetitor,
  getCompetitorSlugs,
} from '@/lib/data';
```

| Function | Exported | Works |
|----------|----------|-------|
| `getPlatforms()` | [ ] | [ ] |
| `getPlatform(slug)` | [ ] | [ ] |
| `getAudius()` | [ ] | [ ] |
| `getCompetitors()` | [ ] | [ ] |
| `getFeatures()` | [ ] | [ ] |
| `getFeature(slug)` | [ ] | [ ] |
| `getComparison(platformId, featureId)` | [ ] | [ ] |
| `getComparisonData(competitorSlug)` | [ ] | [ ] |
| `isValidCompetitor(slug)` | [ ] | [ ] |
| `getCompetitorSlugs()` | [ ] | [ ] |

### 4.2 Function Return Value Tests

Test in browser console or Node:

```javascript
// getPlatforms() - returns all 3
console.log(getPlatforms().length === 3);

// getPlatform('soundcloud') - returns SoundCloud
console.log(getPlatform('soundcloud')?.name === 'SoundCloud');

// getPlatform('invalid') - returns undefined
console.log(getPlatform('invalid') === undefined);

// getAudius() - returns Audius with isAudius=true
console.log(getAudius().isAudius === true);

// getCompetitors() - returns 2 (not Audius)
console.log(getCompetitors().length === 2);
console.log(getCompetitors().every(c => !c.isAudius));

// getFeatures() - returns 15, sorted
const features = getFeatures();
console.log(features.length === 15);
console.log(features[0].sortOrder < features[1].sortOrder);

// getComparisonData('soundcloud') - returns 15 FeatureComparisons
const data = getComparisonData('soundcloud');
console.log(data.length === 15);
console.log(data[0].feature !== undefined);
console.log(data[0].audius !== undefined);
console.log(data[0].competitor !== undefined);

// isValidCompetitor
console.log(isValidCompetitor('soundcloud') === true);
console.log(isValidCompetitor('spotify') === true);
console.log(isValidCompetitor('audius') === false); // Audius is not a competitor
console.log(isValidCompetitor('invalid') === false);

// getCompetitorSlugs
console.log(getCompetitorSlugs().includes('soundcloud'));
console.log(getCompetitorSlugs().includes('spotify'));
console.log(!getCompetitorSlugs().includes('audius'));
```

---

## 5. Constants Verification

### 5.1 Check `lib/constants.ts`

| Constant | Expected | Actual | Pass |
|----------|----------|--------|------|
| `DEFAULT_COMPETITOR` | `'soundcloud'` | | [ ] |
| `EXTERNAL_URLS.audiusApp` | `'https://audius.co'` | | [ ] |
| `EXTERNAL_URLS.blog` | Present | | [ ] |
| `EXTERNAL_URLS.helpCenter` | Present | | [ ] |
| `EXTERNAL_URLS.instagram` | Present | | [ ] |
| `EXTERNAL_URLS.twitter` | Present | | [ ] |
| `EXTERNAL_URLS.discord` | Present | | [ ] |
| `EXTERNAL_URLS.telegram` | Present | | [ ] |

### 5.2 Check `lib/utils.ts`

| Export | Purpose | Exists |
|--------|---------|--------|
| `cn()` | Class name utility | [ ] |

---

## 6. Routing Verification

### 6.1 Static Generation

```bash
npm run build
```

Check build output includes:

| Route | Generated | Pass |
|-------|-----------|------|
| `/` | Static | [ ] |
| `/soundcloud` | Static | [ ] |
| `/spotify` | Static | [ ] |

### 6.2 Page Functionality

Start dev server and test:

```bash
npm run dev
```

| URL | Expected | Actual | Pass |
|-----|----------|--------|------|
| `http://localhost:3000` | Shows SoundCloud comparison data | | [ ] |
| `http://localhost:3000/soundcloud` | Shows SoundCloud comparison data | | [ ] |
| `http://localhost:3000/spotify` | Shows Spotify comparison data | | [ ] |
| `http://localhost:3000/invalid` | Shows 404 page | | [ ] |

### 6.3 Page Data Loading

Each page should display actual comparison data (not just "hello world"):

| Page | Shows competitor name | Shows feature count | Shows sample data | Pass |
|------|----------------------|---------------------|-------------------|------|
| `/` | "SoundCloud" visible | "15 features" or similar | JSON preview or list | [ ] |
| `/soundcloud` | "SoundCloud" visible | Data present | Data present | [ ] |
| `/spotify` | "Spotify" visible | Data present | Data present | [ ] |

### 6.4 Metadata Generation

Check page source for each route:

| Route | Has `<title>` | Title includes competitor | Pass |
|-------|---------------|---------------------------|------|
| `/` | [ ] | [ ] | |
| `/soundcloud` | [ ] | "SoundCloud" | [ ] |
| `/spotify` | [ ] | "Spotify" | [ ] |

---

## 7. Build Verification

### 7.1 Build Commands

| Command | Passes | Output Clean |
|---------|--------|--------------|
| `npm run dev` | [ ] | [ ] |
| `npm run build` | [ ] | [ ] |
| `npm run type-check` | [ ] | [ ] |
| `npm run lint` | [ ] | [ ] |

### 7.2 No Console Errors

Start dev server and check browser console:

| Page | Console Errors | Pass |
|------|----------------|------|
| `/` | None | [ ] |
| `/soundcloud` | None | [ ] |
| `/spotify` | None | [ ] |
| `/invalid` | None | [ ] |

---

## 8. Sign-Off Checklist

All items must pass before frontend can begin:

### Critical (Blocks Frontend)

- [ ] `npm run build` passes
- [ ] `npm run type-check` passes
- [ ] All 3 data files exist with correct record counts
- [ ] All type definitions exported from `types/index.ts`
- [ ] All data utilities exported from `lib/data.ts`
- [ ] `getComparisonData()` returns correct structure
- [ ] `DEFAULT_COMPETITOR` is `'soundcloud'`
- [ ] All routes render with data (not stubs saying "TODO")
- [ ] `/invalid` shows 404 page

### Important (Should Fix)

- [ ] Data referential integrity passes
- [ ] Status values all lowercase
- [ ] Features sorted by sortOrder
- [ ] Platform slugs normalized (`audius` not `audiusmusic`)
- [ ] No console errors on any page

### Nice to Have

- [ ] `npm run lint` passes
- [ ] Code is well-formatted
- [ ] Comments where helpful

---

## QA Result

**Date:** _______________

**Reviewer:** _______________

**Result:** 
- [ ] **APPROVED** - Frontend can begin
- [ ] **BLOCKED** - Issues must be fixed first

**Blocking Issues (if any):**

1. 
2. 
3. 

**Notes:**

