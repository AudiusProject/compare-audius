# QA & Review Plan

> **Parent Document:** [PROJECT_PLAN.md](./PROJECT_PLAN.md)  
> **Scope:** Verification, testing, accessibility, performance, cross-browser QA  
> **Depends On:** [PLAN_BACKEND.md](./PLAN_BACKEND.md) and [PLAN_FRONTEND.md](./PLAN_FRONTEND.md) (both must be complete)

---

## Overview

Verify that the implementation matches specifications, passes quality gates, and is ready for production deployment. This plan covers functional testing, visual QA, accessibility, performance, and cross-browser compatibility.

---

## Prerequisites

Before starting QA, verify both backend and frontend are complete:

```bash
# Project runs
npm run dev

# Build passes
npm run build

# Type check passes  
npm run type-check
```

All routes should render actual content (not stubs):
- `http://localhost:3000` → SoundCloud comparison
- `http://localhost:3000/soundcloud` → SoundCloud comparison
- `http://localhost:3000/spotify` → Spotify comparison
- `http://localhost:3000/invalid` → 404 page

---

## QA Checklist

### 1. Data Integrity

Verify the migrated data is correct:

| Check | Expected | Status |
|-------|----------|--------|
| Platform count | 3 (Audius, SoundCloud, Spotify) | [ ] |
| Feature count | 15 features | [ ] |
| Comparison count | 45 (3 platforms × 15 features) | [ ] |
| Audius always "yes" or "custom" | No "no" status for Audius | [ ] |
| Feature sort order | Matches CSV Sort column | [ ] |
| Status values normalized | All lowercase (yes/no/partial/custom) | [ ] |
| Custom display values | "320 kbps", "160 kbps", "128 kbps" for streaming | [ ] |
| Partial context text | Present for all "partial" statuses | [ ] |

**Spot-check these specific comparisons:**

| Platform | Feature | Expected Status | Expected Context/Value |
|----------|---------|-----------------|------------------------|
| Audius | Streaming Quality | custom | "320 kbps" |
| SoundCloud | Streaming Quality | custom | "128 kbps" |
| Spotify | Streaming Quality | custom | "160 kbps" |
| Audius | Unlimited Uploads | yes | - |
| SoundCloud | Unlimited Uploads | partial | "Premium Subscription Required" |
| Spotify | Unlimited Uploads | no | - |
| Audius | Decentralized | yes | - |
| SoundCloud | Decentralized | no | - |
| Spotify | Decentralized | no | - |

---

### 2. Routing & Navigation

| Check | How to Test | Status |
|-------|-------------|--------|
| Root URL shows SoundCloud | Visit `/` | [ ] |
| `/soundcloud` works | Direct navigation | [ ] |
| `/spotify` works | Direct navigation | [ ] |
| Invalid route shows 404 | Visit `/apple-music` | [ ] |
| 404 has back link | Click "Back to comparison" | [ ] |
| Browser back/forward | Navigate between pages, use browser buttons | [ ] |
| Deep link sharing | Copy URL, open in new tab | [ ] |

---

### 3. Interactive Elements

#### Header Navigation

| Check | How to Test | Status |
|-------|-------------|--------|
| Logo links to home | Click logo | [ ] |
| Compare dropdown opens | Click "Compare" | [ ] |
| Compare dropdown closes on outside click | Click outside | [ ] |
| Compare dropdown closes on Escape | Press Escape | [ ] |
| "Audius vs. SoundCloud" navigates | Click option | [ ] |
| "Audius vs. Spotify" navigates | Click option | [ ] |
| More dropdown opens | Click "More" | [ ] |
| More dropdown has correct links | Verify all items | [ ] |
| "Read The Blog" opens new tab | Click and verify | [ ] |
| "Help Center" opens new tab | Click and verify | [ ] |
| Social links work | Click each icon | [ ] |
| "Open Audius" CTA works | Click button | [ ] |

#### CompetitorSelector (Page Header)

| Check | How to Test | Status |
|-------|-------------|--------|
| Competitor name has purple dotted underline | Visual inspection | [ ] |
| Clicking opens dropdown | Click competitor name | [ ] |
| Dropdown shows all competitors | Visual inspection | [ ] |
| Current competitor highlighted | Visual inspection | [ ] |
| Selecting competitor navigates | Click different competitor | [ ] |
| Dropdown closes after selection | Select and verify | [ ] |
| Dropdown closes on outside click | Click outside | [ ] |
| Dropdown closes on Escape | Press Escape | [ ] |
| Keyboard navigation works | Tab, Enter, Arrow keys | [ ] |

#### Footer

| Check | How to Test | Status |
|-------|-------------|--------|
| Social icons link correctly | Click each | [ ] |
| All footer links work | Click each | [ ] |
| Links open in new tabs | Verify target="_blank" | [ ] |
| Copyright year is current | Visual inspection | [ ] |

---

### 4. Visual QA - Desktop (≥768px)

Compare against Figma designs:
- SoundCloud: https://www.figma.com/design/00i0TtJXSpNoT3tqKvbp6O/Compare.audius?node-id=1-2
- Spotify: https://www.figma.com/design/00i0TtJXSpNoT3tqKvbp6O/Compare.audius?node-id=1-914

| Check | Status |
|-------|--------|
| Header layout matches Figma | [ ] |
| Page header (badge, title, subtitle) matches | [ ] |
| CompetitorSelector styling (purple underline) matches | [ ] |
| Comparison table layout matches | [ ] |
| Platform logos display correctly | [ ] |
| Platform logo sizing matches Figma | [ ] |
| Feature row layout matches | [ ] |
| Alternating row backgrounds present | [ ] |
| Status indicator icons match (size, color) | [ ] |
| Green checkmark color correct | [ ] |
| Red X color correct | [ ] |
| Gray dash color correct | [ ] |
| Context text styling matches | [ ] |
| Custom value text styling matches | [ ] |
| Footer layout matches | [ ] |
| Typography (fonts, sizes, weights) matches | [ ] |
| Spacing (padding, margins) matches | [ ] |
| Colors match Figma exactly | [ ] |

---

### 5. Visual QA - Mobile (<768px)

Compare against Figma designs:
- SoundCloud: https://www.figma.com/design/00i0TtJXSpNoT3tqKvbp6O/Compare.audius?node-id=1-425
- Spotify: https://www.figma.com/design/00i0TtJXSpNoT3tqKvbp6O/Compare.audius?node-id=1-1335

| Check | Status |
|-------|--------|
| Table hidden, cards visible | [ ] |
| Card layout matches Figma | [ ] |
| Card stacking correct | [ ] |
| Platform sections within card correct | [ ] |
| Mobile header layout | [ ] |
| Mobile navigation (hamburger if present) | [ ] |
| Page header responsive | [ ] |
| Footer responsive | [ ] |
| Touch targets ≥ 44px | [ ] |
| No horizontal scroll | [ ] |
| Text readable without zooming | [ ] |

---

### 6. Responsive Breakpoints

Test at these widths:

| Width | Expected Layout | Status |
|-------|-----------------|--------|
| 375px | Mobile (cards) | [ ] |
| 414px | Mobile (cards) | [ ] |
| 768px | Desktop (table) | [ ] |
| 1024px | Desktop (table) | [ ] |
| 1440px | Desktop (table) | [ ] |
| 1920px | Desktop (table, centered) | [ ] |

---

### 7. Accessibility

#### Automated Testing

Run axe-core or similar:

```bash
# Install if needed
npm install -D @axe-core/cli

# Run audit
npx axe http://localhost:3000 --exit
```

| Check | Status |
|-------|--------|
| No critical axe violations | [ ] |
| No serious axe violations | [ ] |
| Warnings reviewed and acceptable | [ ] |

#### Manual Testing

| Check | How to Test | Status |
|-------|-------------|--------|
| Skip to content link (if present) | Tab from page load | [ ] |
| All interactive elements focusable | Tab through page | [ ] |
| Focus order logical | Tab through page | [ ] |
| Focus visible on all elements | Tab and observe | [ ] |
| Dropdowns keyboard accessible | Tab, Enter, Escape, Arrows | [ ] |
| Images have alt text | Inspect logos | [ ] |
| Links have descriptive text | Review link text | [ ] |
| Color contrast sufficient | Use contrast checker | [ ] |
| Page works with 200% zoom | Browser zoom | [ ] |
| Screen reader announces content correctly | Use VoiceOver/NVDA | [ ] |

#### ARIA Attributes

| Check | Status |
|-------|--------|
| Dropdowns have aria-expanded | [ ] |
| Dropdowns have aria-haspopup | [ ] |
| Dropdown menus have role="menu" | [ ] |
| Menu items have role="menuitem" or role="option" | [ ] |
| CompetitorSelector has role="listbox" | [ ] |
| Selected option has aria-selected="true" | [ ] |

---

### 8. Performance

#### Lighthouse Audit

Run on production build:

```bash
npm run build
npm run start
# Then run Lighthouse in Chrome DevTools
```

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Performance | > 90 | | [ ] |
| Accessibility | > 95 | | [ ] |
| Best Practices | > 90 | | [ ] |
| SEO | > 90 | | [ ] |

#### Core Web Vitals

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s | | [ ] |
| FID (First Input Delay) | < 100ms | | [ ] |
| CLS (Cumulative Layout Shift) | < 0.1 | | [ ] |

#### Bundle Analysis

```bash
# Add to package.json scripts if not present
# "analyze": "ANALYZE=true next build"

npm run analyze
```

| Check | Status |
|-------|--------|
| No unexpectedly large dependencies | [ ] |
| Images optimized | [ ] |
| No unused JavaScript | [ ] |

---

### 9. SEO

| Check | How to Test | Status |
|-------|-------------|--------|
| Title tag present | View source | [ ] |
| Title includes competitor name | View source on /spotify | [ ] |
| Meta description present | View source | [ ] |
| Meta description relevant | Read content | [ ] |
| Open Graph tags present | Use og:image validator | [ ] |
| Canonical URL correct | View source | [ ] |
| No noindex on public pages | View source | [ ] |
| Valid HTML | W3C validator | [ ] |

**Test URLs:**
- https://www.opengraph.xyz/ (OG preview)
- https://validator.w3.org/ (HTML validation)
- https://search.google.com/test/rich-results (structured data)

---

### 10. Cross-Browser Testing

Test all functionality in:

| Browser | Version | Desktop | Mobile | Status |
|---------|---------|---------|--------|--------|
| Chrome | Latest | [ ] | [ ] | |
| Firefox | Latest | [ ] | N/A | |
| Safari | Latest | [ ] | [ ] | |
| Edge | Latest | [ ] | N/A | |

**Specific checks per browser:**
- [ ] Layout renders correctly
- [ ] Fonts load correctly
- [ ] Dropdowns work
- [ ] Navigation works
- [ ] Animations smooth (if any)

---

### 11. Error Handling

| Check | How to Test | Status |
|-------|-------------|--------|
| 404 page displays for invalid routes | Visit /invalid | [ ] |
| 404 page has navigation back | Check for link | [ ] |
| 404 maintains header/footer | Visual inspection | [ ] |
| No console errors on any page | Check DevTools | [ ] |
| No console warnings (review acceptable) | Check DevTools | [ ] |
| Network errors handled gracefully | Throttle network | [ ] |

---

### 12. External Links Audit

Verify all external URLs work (no 404s):

| Link | URL | Works | Status |
|------|-----|-------|--------|
| Open Audius | https://audius.co | [ ] | |
| Blog | https://blog.audius.co | [ ] | |
| Help Center | https://support.audius.co | [ ] | |
| Instagram | https://instagram.com/audiusmusic | [ ] | |
| Twitter | https://twitter.com/audius | [ ] | |
| Discord | https://discord.gg/audius | [ ] | |
| Telegram | https://t.me/audius | [ ] | |
| Download | https://audius.co/download | [ ] | |
| Events | https://audius.co/events | [ ] | |
| Merch Store | https://store.audius.co | [ ] | |
| Brand/Press | https://audius.co/brand | [ ] | |
| Engineering | https://audius.co/engineering | [ ] | |
| Open Audio Foundation | https://openaudius.org | [ ] | |
| Terms of Service | https://audius.co/legal/terms-of-use | [ ] | |
| Privacy Policy | https://audius.co/legal/privacy-policy | [ ] | |

---

## Bug Report Template

When filing issues, use this format:

```markdown
## Bug: [Brief description]

**Severity:** Critical / High / Medium / Low

**Page:** [URL where bug occurs]

**Steps to reproduce:**
1. 
2. 
3. 

**Expected behavior:**
[What should happen]

**Actual behavior:**
[What actually happens]

**Screenshots:**
[Attach if visual bug]

**Browser/Device:**
- Browser: 
- Version: 
- OS: 
- Device: 

**Additional context:**
[Any other relevant info]
```

---

## QA Sign-Off Criteria

All of the following must be true before approving for deployment:

- [ ] All data integrity checks pass
- [ ] All routes work correctly
- [ ] All interactive elements function properly
- [ ] Desktop visual QA matches Figma (no major deviations)
- [ ] Mobile visual QA matches Figma (no major deviations)
- [ ] No critical or serious accessibility violations
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 95
- [ ] No console errors
- [ ] All external links work
- [ ] Works in Chrome, Safari, Firefox (latest)
- [ ] Works on iOS Safari and Android Chrome

---

## Deployment Verification

After deployment to production (compare.audius.co):

| Check | Status |
|-------|--------|
| Site loads on production URL | [ ] |
| HTTPS certificate valid | [ ] |
| All routes work | [ ] |
| Images load from CDN | [ ] |
| No mixed content warnings | [ ] |
| Performance similar to staging | [ ] |
| Redirects work (if any) | [ ] |
| Analytics tracking (if added later) | [ ] |

---

## Appendix: Testing Tools

| Tool | Purpose | URL/Command |
|------|---------|-------------|
| Lighthouse | Performance & accessibility | Chrome DevTools |
| axe DevTools | Accessibility | Chrome extension |
| WAVE | Accessibility | https://wave.webaim.org/ |
| OG Image Validator | Social sharing | https://www.opengraph.xyz/ |
| W3C Validator | HTML validation | https://validator.w3.org/ |
| WebPageTest | Performance deep-dive | https://www.webpagetest.org/ |
| BrowserStack | Cross-browser | https://www.browserstack.com/ |
| Contrast Checker | Color accessibility | https://webaim.org/resources/contrastchecker/ |
