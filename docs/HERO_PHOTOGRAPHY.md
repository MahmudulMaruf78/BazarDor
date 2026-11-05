# BazarDor — Hero Section Photography Research & Implementation

**Date:** 2025-11-05  
**Scope:** Public homepage hero (`HomePageHero`) — visual and asset pipeline only. No marketplace, auth, or pricing logic changed.

## 1. Concepts evaluated

| Concept | Summary | Brand fit | Bangladesh context | Hero readability | Verdict |
|---------|---------|-----------|-------------------|------------------|---------|
| **A** Farmer in green field | Trust, farmer identity | High | High when photo is BD-specific | Subject competes with left-aligned headline unless cropped | **Supporting alternate** |
| **B** Harvesting crops | Shows production | Medium | Medium (stock often generic) | Busy mid-frame action | Not selected |
| **C** Fresh produce | Variety, freshness | Medium | Low unless local market shoot | Works as product strip, not full hero | Not selected for hero |
| **D** Farmer–buyer handoff | Direct connection | High | Hard to find licensed authentic BD stock | Two subjects + hands = cluttered | Not selected |
| **E** Agricultural landscape | National identity, calm backdrop | High | High with aerial/rural BD scene | Excellent with left gradient + `object-position` right | **Primary hero** |
| **F** Modern market | Commerce ecosystem | Medium | Variable | Crowds and stalls reduce text contrast | Not selected |

## 2. Selected images

### Primary — Concept E (Bangladesh agricultural landscape)

- **File:** `public/home-hero/hero-primary.jpg` (+ `hero-primary-mobile.jpg` for ≤767px)
- **Source:** Unsplash photo [vraKTroWlbY](https://unsplash.com/photos/an-aerial-view-of-a-large-field-with-trees-vraKTroWlbY) — aerial view near **Boalkhali, Chittagong, Bangladesh**, with rubber plantation and **rice fields** on the horizon (photographer metadata on Unsplash page).
- **License:** [Unsplash License](https://unsplash.com/license) — free use including commercial use; no attribution required by license, but photographer credit is recorded here for prototype transparency.
- **Why:** Authentic Bangladesh rural/agricultural setting, natural greens, wide composition keeps the **left half** calmer for headline, CTAs, and demo tips card; right side carries landscape detail.

### Supporting — Concept A (Bangladeshi farmer in field)

- **File:** `public/home-hero/hero-supporting.jpg`
- **Source:** Unsplash photo [oTtL2Z-4i1s](https://unsplash.com/photos/a-person-standing-in-a-field-of-rice-oTtL2Z-4i1s) — **Chilmari, Bangladesh**, rice field (Kabiur Rahman Riyad / @riiyad on Unsplash).
- **License:** Unsplash License (same as above).
- **Why kept in repo:** Strong farmer-trust narrative for future campaigns or A/B swaps; **not composited into the current hero** to avoid a busy split collage and to keep one clear focal background (ponytail: swap via script + constants only).

## 3. Implementation summary

- **Component:** `src/features/home/HomeHeroSections.tsx` — `HomePageHero`
- **Assets:** `src/constants/home-hero-assets.ts`
- **Fetch script:** `scripts/fetch-home-hero-images.mjs`
- **i18n alt text:** `homeHeroPhotoPrimaryAlt`, `homeHeroPhotoSupportingAlt` in `src/lib/i18n/messages.ts` (EN + BN)
- **Layout preserved:** Existing headline, subtitle, Explore + Sign in CTAs, demo tips panel, feature strip below, market products section.
- **Overlay:** Existing brand-aligned green/cream gradients (`from-background` + `via-primary`) for contrast — not a flat heavy tint.
- **Responsive:** `<picture>` serves mobile JPG; `object-[68%_42%]` on small screens, `md:object-[78%_center]` on larger; `min-h-[min(520px,85vh)]`, `overflow-hidden`, max-width content grid unchanged.

## 4. Responsive verification (design intent)

| Viewport | Expected behavior |
|----------|-------------------|
| **375px / 390px** | Single column; text and CTAs above tips card; narrower mobile crop; no horizontal scroll |
| **768px** | Tablet uses desktop primary asset; two-column grid from `lg` breakpoint |
| **1366px / 1440px** | Full-width photo; landscape visible on right; copy remains on left with gradient |

**Manual check:** run `npm run dev`, open `/`, resize DevTools across widths above.

Automated e2e does not pixel-compare hero art; it validates existing home navigation and flows still pass.

## 5. Files added or modified

| Path | Change |
|------|--------|
| `public/home-hero/hero-primary.jpg` | Added (Unsplash download) |
| `public/home-hero/hero-primary-mobile.jpg` | Added |
| `public/home-hero/hero-supporting.jpg` | Added |
| `public/home-hero/README.md` | Added |
| `scripts/fetch-home-hero-images.mjs` | Added |
| `src/constants/home-hero-assets.ts` | Added |
| `src/features/home/HomeHeroSections.tsx` | Updated hero photography + `<picture>` |
| `src/lib/i18n/messages.ts` | Updated alt strings |
| `docs/HERO_PHOTOGRAPHY.md` | This report |

## 6. Remaining visual limitations

- **Prototype disclaimer:** Hero photos are demo/sample art, not verified government or live market imagery (aligned with project rules).
- **No `<picture>` type WebP yet** — same pattern as product cards; add WebP siblings if build size becomes an issue.
- **Supporting image unused in UI** — intentional; enable by changing `HomePageHero` to swap `HOME_HERO_PRIMARY.src` or a seasonal constant.
- **Photographer approval for production** — Unsplash License permits use; product owner should still confirm brand fit before public marketing outside this prototype.
- **Old `hero-1.jpg`–`hero-3.jpg`** — prior UI mockup shots; safe to delete locally; not referenced in code.

## 7. QA commands

**2025-11-05 run (local):**

| Command | Result |
|---------|--------|
| `npm run qa` | Pass (lint warnings pre-existing; 158 unit tests; production build OK) |
| `npm run build` | Included in `qa` — pass |
| `npm run test:e2e` | Pass after e2e locator `.first()` updates for duplicate hero Sign in links (39 tests) |

```bash
npm run qa
npm run build
npm run test:e2e
```
