# Compare Audius

A product comparison website for Audius, comparing features against competitors like Spotify and SoundCloud.

**Live site**: [compare.audius.co](https://compare.audius.co)

## Overview

This application serves two purposes:

1. **Public Site** — A responsive comparison page showing how Audius stacks up against competitors
2. **Admin Interface** — A protected dashboard for managing platforms, features, and comparisons

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Database | Turso (SQLite Edge) |
| ORM | Drizzle ORM |
| Authentication | NextAuth.js v5 (Google OAuth) |
| Image Hosting | Cloudinary |
| Styling | Tailwind CSS |
| Deployment | Vercel |

---

## Project Structure

```
compare-audius/
├── app/
│   ├── (public)/              # Public site routes (grouped)
│   │   ├── [competitor]/      # Dynamic competitor pages
│   │   │   ├── page.tsx       # /soundcloud, /spotify, etc.
│   │   │   ├── opengraph-image.tsx  # Dynamic OG images
│   │   │   └── twitter-image.tsx    # Dynamic Twitter images
│   │   ├── layout.tsx         # Public layout with header/footer
│   │   └── page.tsx           # Root redirect to default competitor
│   ├── admin/                 # Admin interface (protected)
│   │   ├── comparisons/       # Comparison editor
│   │   ├── features/          # Feature CRUD
│   │   ├── platforms/         # Platform CRUD
│   │   ├── layout.tsx         # Admin layout with nav
│   │   └── page.tsx           # Admin dashboard
│   ├── api/                   # API routes
│   │   ├── auth/              # NextAuth endpoints
│   │   ├── comparisons/       # Comparison CRUD
│   │   ├── features/          # Feature CRUD
│   │   ├── platforms/         # Platform CRUD
│   │   └── upload/            # Image upload to Cloudinary
│   ├── llms.txt/              # LLM context (dynamic route)
│   ├── llms-full.txt/         # Full LLM data (dynamic route)
│   ├── robots.ts              # Robots.txt generator
│   ├── sitemap.ts             # Dynamic sitemap
│   ├── login/                 # Login page
│   └── layout.tsx             # Root layout
├── components/
│   ├── admin/                 # Admin-specific components
│   ├── comparison/            # Comparison display components
│   ├── layout/                # Header, footer, navigation
│   ├── seo/                   # SEO components (structured data)
│   └── ui/                    # Shared UI primitives
├── db/
│   ├── index.ts               # Drizzle client
│   └── schema.ts              # Database schema
├── lib/
│   ├── api-helpers.ts         # API utility functions
│   ├── cloudinary.ts          # Cloudinary SDK configuration
│   ├── constants.ts           # App constants (URLs, defaults)
│   ├── data.ts                # Data access layer
│   └── utils.ts               # Shared utilities
├── scripts/
│   ├── migrate-csv.ts         # CSV to JSON migration
│   └── seed-db.ts             # Database seeding
├── types/
│   └── index.ts               # TypeScript type definitions
├── auth.ts                    # NextAuth configuration
├── middleware.ts              # Route protection
└── drizzle.config.ts          # Drizzle configuration
```

---

## Data Model

### Platforms

Represents Audius and its competitors (Spotify, SoundCloud, etc.).

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Display name |
| `slug` | string | URL-friendly identifier |
| `logo` | string | Logo URL |
| `isAudius` | boolean | True for Audius platform only |
| `isDraft` | boolean | Draft platforms are hidden from public |

### Features

The features being compared across platforms.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Display name |
| `slug` | string | URL-friendly identifier |
| `description` | string | Feature description |
| `sortOrder` | number | Display order |
| `isDraft` | boolean | Draft features are hidden from public |

### Comparisons

The intersection of platforms and features — how each platform performs on each feature.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `platformId` | string | Foreign key to platform |
| `featureId` | string | Foreign key to feature |
| `status` | enum | `yes`, `no`, `partial`, or `custom` |
| `displayValue` | string? | Custom display text (for `custom` status) |
| `context` | string? | Additional context (for `partial` status) |

#### Comparison Status Types

| Status | Icon | Use Case |
|--------|------|----------|
| `yes` | ✓ (green) | Feature fully available |
| `no` | ✗ (red) | Feature not available |
| `partial` | — (gray) | Available with conditions (uses `context` field) |
| `custom` | (text) | Custom display value (e.g., "320 kbps") |

---

## Key Concepts

### Flexible Comparisons

Features are only displayed on the public site if **both** Audius and the competitor have a comparison record for that feature. This allows:

- Different competitors to be compared on different feature sets
- New features to be added without breaking existing comparisons
- Gradual rollout of new platforms

**Example**: If "Podcast Support" is added as a feature but only Audius and Spotify have comparison records, it won't appear on the SoundCloud comparison page.

### Draft Mode

Both platforms and features support a `isDraft` boolean:

- **Draft platforms**: Hidden from competitor selection, pages inaccessible
- **Draft features**: Hidden from all comparison pages

This allows content to be prepared before publishing.

### Route Structure

| Route | Purpose |
|-------|---------|
| `/` | Redirects to default competitor (`/soundcloud`) |
| `/[competitor]` | Public comparison page |
| `/admin` | Admin dashboard |
| `/admin/platforms` | Platform management |
| `/admin/features` | Feature management |
| `/admin/comparisons` | Comparison editor |
| `/login` | Google OAuth login |

---

## Authentication

The admin interface is protected via Google OAuth, restricted to `@audius.co` email addresses.

### Setup

1. Create a Google OAuth application in [Google Cloud Console](https://console.cloud.google.com/)
2. Configure OAuth consent screen
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI: `https://your-domain.com/api/auth/callback/google`

### Environment Variables

```env
# NextAuth
AUTH_SECRET=your-generated-secret
AUTH_URL=https://your-domain.com

# Google OAuth
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

### Domain Restriction

Email domain restriction is enforced in `auth.ts`:

```typescript
async signIn({ profile }) {
  return profile?.email?.endsWith('@audius.co') ?? false;
}
```

To add additional allowed emails or domains, modify this callback.

---

## Database

### Turso Setup

1. Install Turso CLI: `brew install tursodatabase/tap/turso`
2. Login: `turso auth login`
3. Create database: `turso db create compare-audius`
4. Get credentials:
   ```bash
   turso db show compare-audius --url
   turso db tokens create compare-audius
   ```

### Environment Variables

```env
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

### Schema Management

```bash
# Generate migrations
npx drizzle-kit generate

# Push schema changes
npx drizzle-kit push

# Open Drizzle Studio
npx drizzle-kit studio
```

### Seeding

Initial data can be seeded from JSON files in `/data`:

```bash
npx tsx scripts/seed-db.ts
```

---

## Image Hosting (Cloudinary)

Platform logos are hosted on Cloudinary for reliable CDN delivery and automatic optimization.

### Setup

1. Create account at [cloudinary.com](https://cloudinary.com) (free tier)
2. Get credentials from Dashboard → Product Environment Credentials
3. Add to `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### How It Works

- **Upload**: Admin uploads image via drag-and-drop in platform form
- **Processing**: Server-side API route uploads to Cloudinary with transformations
- **Storage**: Images stored in `compare-audius/logos/` folder
- **Delivery**: Served via Cloudinary CDN with automatic format optimization

### Image Transformations

Uploaded images are automatically:
- Resized to max 200×200px (maintaining aspect ratio)
- Optimized for quality (`q_auto`)
- Converted to best format for browser (`f_auto` → WebP where supported)

### Upload API

```
POST /api/upload
Content-Type: multipart/form-data
Body: file (image)

Response: { url, publicId, width, height, format }
```

**Constraints**:
- Max file size: 2MB
- Allowed types: PNG, JPG, WebP, SVG
- Requires authentication

---

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm
- Turso account (or local SQLite for development)

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure environment variables
# (see Authentication and Database sections)

# Push database schema
npx drizzle-kit push

# Seed initial data (optional)
npx tsx scripts/seed-db.ts

# Start development server
npm run dev
```

### Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build (Next.js) |
| `npm run build:cf` | Build for Cloudflare Pages (uses @opennextjs/cloudflare) |
| `npm run preview` | Preview Cloudflare Pages build locally |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx drizzle-kit studio` | Open database GUI |
| `npx tsx scripts/seed-db.ts` | Seed database |

---

## Deployment

### Cloudflare Pages

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Connect to Cloudflare Pages**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages
   - Click "Create a project" → "Connect to Git"
   - Select your repository

3. **Configure build settings**:
   - **Build command**: `npm run build:cf`
   - **Build output directory**: `.open-next`
   - **Root directory**: `/` (or leave empty)
   - **Node.js version**: 18 or higher

4. **Set environment variables** in Cloudflare Pages dashboard:
   - Go to Settings → Environment Variables
   - Add all variables from `.dev.vars.example`
   - **Important**: Update `AUTH_URL` to your Cloudflare Pages domain (e.g., `https://your-project.pages.dev`)

5. **Update Google OAuth redirect URI**:
   - In Google Cloud Console, add your Cloudflare Pages callback URL:
     `https://your-project.pages.dev/api/auth/callback/google`

6. **Deploy**: Cloudflare Pages will automatically deploy on every push to your main branch

### Local Development with Cloudflare

**Note**: Local preview with `wrangler pages dev` is not fully supported due to bundling limitations with OpenNext Cloudflare's output structure. Use Cloudflare Pages preview deployments for testing instead.

For building:

```bash
# Build for Cloudflare Pages (this runs Next.js build + OpenNext transformation)
npm run build:cf
```

**Testing**: Use Cloudflare Pages preview deployments:
- Push to a branch or create a PR to trigger a preview deployment
- Preview deployments are automatically created for non-production branches
- This is the recommended way to test your Cloudflare Pages deployment

**R2 Buckets Setup**: For production deployments, you'll need to create R2 buckets in your Cloudflare dashboard:
1. Go to Cloudflare Dashboard → R2
2. Create buckets named `next-inc-cache` (production) and `next-inc-cache-preview` (previews)
3. In Cloudflare Pages project settings, bind these R2 buckets with the binding name `NEXT_INC_CACHE_R2_BUCKET`

### Vercel (Alternative)

1. Connect repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy

The app uses ISR (Incremental Static Regeneration) — pages are statically generated and revalidated on demand when data changes.

### Environment Variables for Production

```env
# Database
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token

# Auth
AUTH_SECRET=generated-secret
AUTH_URL=https://compare.audius.co
AUTH_GOOGLE_ID=your-client-id
AUTH_GOOGLE_SECRET=your-client-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## SEO & LLM Optimization

The site includes comprehensive SEO features to maximize search engine visibility and AI/LLM readability.

### Technical SEO

| File | Purpose |
|------|---------|
| `/robots.txt` | Allows crawling of public pages, blocks `/admin`, `/api`, `/login` |
| `/sitemap.xml` | Dynamic sitemap with all competitor pages (revalidates hourly) |

### Metadata

- **OpenGraph**: Full OG tags for rich social sharing previews
- **Twitter Cards**: Summary large image cards with `@audius` attribution
- **Canonical URLs**: Proper canonical tags to prevent duplicate content issues
- **Keywords**: Relevant keywords per page for search discovery

### JSON-LD Structured Data

Each page includes structured data for rich search results:

| Schema | Location | Purpose |
|--------|----------|---------|
| Organization | Root layout | Audius company info with social links |
| WebSite | Root layout | Site metadata and publisher info |
| FAQPage | Comparison pages | Each feature as a Q&A for rich snippets |
| ItemList | Comparison pages | Feature list structure |
| WebPage | Comparison pages | Page context and relationships |

### LLM-Friendly Content

Two dynamic routes provide machine-readable content:

| Route | Purpose | Update Frequency |
|-------|---------|------------------|
| `/llms.txt` | Quick overview for AI assistants | Hourly |
| `/llms-full.txt` | Complete comparison data in plain text | Hourly |

These routes pull directly from the database, so new platforms and features are automatically included within 1 hour of being published.

### Verification Tools

After deployment, verify SEO with:
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

---

## API Reference

All API routes are under `/api/` and require authentication for write operations.

### Platforms

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/platforms` | List all platforms |
| POST | `/api/platforms` | Create platform |
| GET | `/api/platforms/[id]` | Get platform |
| PUT | `/api/platforms/[id]` | Update platform |
| DELETE | `/api/platforms/[id]` | Delete platform |

### Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/features` | List all features |
| POST | `/api/features` | Create feature |
| GET | `/api/features/[id]` | Get feature |
| PUT | `/api/features/[id]` | Update feature |
| DELETE | `/api/features/[id]` | Delete feature |
| POST | `/api/features/reorder` | Reorder features |

### Comparisons

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comparisons` | List all comparisons |
| POST | `/api/comparisons` | Bulk upsert comparisons |
| DELETE | `/api/comparisons/[id]` | Delete comparison |

### Uploads

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload image to Cloudinary |

---

## Component Architecture

### Public Site Components

```
ComparisonPage
├── PageHeader
│   └── CompetitorSelector (dropdown)
├── ComparisonTable (desktop)
│   ├── PlatformHeader (×2)
│   └── FeatureRow (×n)
│       └── StatusIndicator (×2)
└── ComparisonCards (mobile)
    └── FeatureCard (×n)
        └── StatusIndicator (×2)
```

### Admin Components

```
AdminLayout
├── AdminNav
└── [Page Content]
    ├── PlatformForm / FeatureForm
    │   └── ImageUpload (drag-and-drop)
    ├── DeleteConfirm (modal)
    ├── Toast (notifications)
    └── FeatureComparisonCard
        └── StatusSelect
```

---

## Styling

The project uses Tailwind CSS with custom configuration:

### Custom Colors

```css
--audius-purple: #7E1BCC
--audius-purple-dark: #6B17AD
--surface-alt: #F9F9F9
```

### Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | — |
| `md` | 768px | Switch from cards to table |
| `lg` | 1024px | — |

### Container

```css
.container-narrow {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

---

## Contributing

1. Create a feature branch
2. Make changes
3. Test locally with `npm run dev`
4. Run `npm run lint` to check for issues
5. Submit PR

---

## License

Internal Audius project.
