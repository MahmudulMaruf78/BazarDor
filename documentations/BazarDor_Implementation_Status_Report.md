# BazarDor — Implementation Status Report

| Field | Value |
|-------|--------|
| **Report date** | 5 November 2026 |
| **Prototype type** | Frontend-only React + Vite + TypeScript (demo data, not production government services) |
| **Demo storage schema** | `STORAGE_SCHEMA_VERSION = 8` ([`src/constants/storage.ts`](../src/constants/storage.ts)) |
| **IndexedDB** | `bazardor-demo` v2 |

After pulling seed or schema changes, use **Admin → Reset demo dataset** so browser IndexedDB matches the bundle.

---

## Sources consulted

| Document | Role |
|----------|------|
| [`BazarDor_Project_Master_Plan_v2.0.docx`](./BazarDor_Project_Master_Plan_v2.0.docx) | Business scope, rules, open decisions (OD-01 … OD-11), phase summary table |
| [`BazarDor_Full_Build_Setup_and_Phase_Guide_v1.0.docx`](./BazarDor_Full_Build_Setup_and_Phase_Guide_v1.0.docx) | Eight implementation phases, exit checks, setup commands |
| [`BazarDor_Simple_Data_Flow_Diagram_v2.0.docx`](./BazarDor_Simple_Data_Flow_Diagram_v2.0.docx) | Stakeholder data-flow narrative |
| [`PACKAGE_README.txt`](./PACKAGE_README.txt) | Documentation package index |
| [`DEMO_WALKTHROUGH.md`](./DEMO_WALKTHROUGH.md) | ~15 min demo script |
| [`PHASE8_QA_CHECKLIST.md`](./PHASE8_QA_CHECKLIST.md) | QA gate and manual checklist status |
| [`BANGLADESH_LOCATIONS_SOURCE.md`](./BANGLADESH_LOCATIONS_SOURCE.md), [`BANGLADESH_LOCATIONS_UNVERIFIED.md`](./BANGLADESH_LOCATIONS_UNVERIFIED.md) | Location import provenance and gaps |
| [`.cursor/rules/bazardor-project.mdc`](../.cursor/rules/bazardor-project.mdc) | Coding and non-negotiable price/consent rules |

This report maps **what is implemented in the repo** to those sources. It does **not** replace the Master Plan or invent policy for open decisions.

---

## Executive summary

| Category | Status |
|----------|--------|
| **Phases 1–8 (prototype scope)** | Implemented with automated tests, e2e walkthrough, and Phase 8 checklist marked verified (2026-11-05) |
| **Master Plan “included” frontend areas** | Core flows for all six roles + public home/explore; demo-labelled throughout |
| **Master Plan “excluded” items** | Not built (real OTP, backend, payments, cross-device sync, live gov feeds, etc.) |
| **Location data** | **Partial** — full division/district/upazila tree; unions from BD-JSON where matched; synthetic demo unions for 198 unmatched upazilas |
| **Beyond phase guide** | Richer demo catalog (16 products, images), home listing browse filters, official average on cards, `ProductCombobox`, expanded seed averages |
| **Open decisions (OD-01 … OD-11)** | Prototype uses **provisional defaults** where documented; owner confirmation still required for production |

---

## Phase-by-phase status

Aligned with **Master Plan §16** and **Full Build Phase Guide** exit checks. Evidence cites repo paths and tests.

### Phase 1 — Foundation

**Goal (guide):** App shell, styling, routing, store, responsive layouts, seed data runs locally.

**Done**

- Vite + React 19 + TypeScript + Tailwind + shadcn/ui (Base UI nova style)
- Routes: public home (`/`), explore (`/explore`), demo login, role dashboards, listing detail ([`src/app/router/index.tsx`](../src/app/router/index.tsx))
- Layouts: `PublicLayout`, `AuthLayout`, `DashboardLayout` (responsive nav)
- Redux store + typed hooks ([`src/app/store`](../src/app/store))
- Bangladesh location hierarchy: build script, JSON seed, selector UI ([`scripts/build-bangladesh-locations.mjs`](../scripts/build-bangladesh-locations.mjs), [`BangladeshLocationSelector`](../src/components/common/BangladeshLocationSelector.tsx))
- PWA plugin configured in Vite (shell precache for offline reopen)

**Exit checks (guide)**

| Check | Status |
|-------|--------|
| App runs locally; public and dashboard routes load | Met |
| Mobile navigation works | Met (dashboard layout) |
| No page claims real government/live services | Met (demo disclaimers) |

**Gaps vs aspirational Master Plan public site**

- Full national “product directory” as separate CMS-style site is folded into home/explore + marketplace browse rather than a large standalone marketing site.

---

### Phase 2 — Data layer

**Goal:** Typed records, repositories, mock adapters, LocalStorage + IndexedDB; components do not touch storage directly.

**Done**

- Domain types and Zod validation ([`src/types`](../src/types), [`src/test/domain-schemas.test.ts`](../src/test/domain-schemas.test.ts))
- Repository interfaces + mock IndexedDB adapters ([`src/data/repositories/interfaces.ts`](../src/data/repositories/interfaces.ts), [`src/data/adapters`](../src/data/adapters))
- Demo seed bundle + lifecycle reset ([`src/data/seed/index.ts`](../src/data/seed/index.ts), [`src/data/bootstrap/demoDataLifecycle.ts`](../src/data/bootstrap/demoDataLifecycle.ts))
- Session in LocalStorage only ([`src/constants/storage.ts`](../src/constants/storage.ts))

**Exit checks**

| Check | Status |
|-------|--------|
| Reset restores demo dataset | Met (Admin + `resetDemoData`) |
| Components use repositories/services, not raw storage | Met (architecture rule enforced in code review / rules) |

---

### Phase 3 — Shared business rules

**Goal:** Pure TypeScript services for units, normalization, eligibility, averages, expiry, stock, anomaly flags.

**Done**

- Unit conversion (kg, maund, quintal, tonne) and price normalization ([`src/services/unitConversion.ts`](../src/services/unitConversion.ts), [`priceNormalization.ts`](../src/services/priceNormalization.ts))
- Consent + approval rules, self-approval block ([`consentService.ts`](../src/services/consentService.ts), [`approvalService.ts`](../src/services/approvalService.ts))
- Latest entry per farmer, minimum two farmers, geographic pooling ([`latestEntrySelector.ts`](../src/services/latestEntrySelector.ts), [`locationScope.ts`](../src/services/locationScope.ts), [`officialMarketPriceService.ts`](../src/services/officialMarketPriceService.ts))
- Expiry / freshness ([`expiryService.ts`](../src/services/expiryService.ts))
- Stock transitions + anomaly highlighting ([`stockService.ts`](../src/services/stockService.ts), [`anomalyService.ts`](../src/services/anomalyService.ts))
- Tests: [`unit-and-price.test.ts`](../src/test/services/unit-and-price.test.ts), [`official-average.test.ts`](../src/test/services/official-average.test.ts), [`approval-consent.test.ts`](../src/test/services/approval-consent.test.ts), [`stock-anomaly.test.ts`](../src/test/services/stock-anomaly.test.ts)

**Exit checks**

| Check | Status |
|-------|--------|
| Unit tests for conversions, 2-farmer rule, pooling, expiry, anomaly handling | Met |

**Note:** Anomaly thresholds are configurable/demo-labelled; auto-reject from anomaly is **not** implemented (Master Plan / project rules).

---

### Phase 4 — Demo authentication and role dashboards

**Goal:** Six roles, protected routes, permission keys, demo login.

**Done**

- Demo login with fictional accounts ([`DemoLoginPage`](../src/features/auth/DemoLoginPage.tsx))
- `RequireAuth`, `RequireRouteRole`, route permissions ([`guards.tsx`](../src/app/router/guards.tsx), [`route-permissions.ts`](../src/app/router/route-permissions.ts))
- Role dashboards: Farmer, Buyer, Seller, Field Officer, Department, Admin
- Tests: [`auth-guards.test.ts`](../src/test/auth-guards.test.ts), [`app-shell.test.tsx`](../src/test/app-shell.test.tsx)

**Exit checks**

| Check | Status |
|-------|--------|
| Each role opens its dashboard; unauthorized routes blocked in UI | Met |
| Public routes remain accessible without login | Met |

**Not done:** Server-enforced security (explicitly out of prototype scope).

---

### Phase 5 — Marketplace

**Goal:** Listings, bids, stock reservation, transactions, history.

**Done**

- Farmer: price observations, listings, stock fields ([`FarmerMarketplacePage`](../src/features/marketplace/FarmerMarketplacePage.tsx))
- Buyer: browse, offers ([`BuyerMarketplacePage`](../src/features/marketplace/BuyerMarketplacePage.tsx))
- Seller: accept/reject offers, bulk listing ([`SellerMarketplacePage`](../src/features/marketplace/SellerMarketplacePage.tsx))
- Listing detail route ([`ListingDetailPage`](../src/features/marketplace/ListingDetailPage.tsx))
- Business rules in services; tests [`marketplace.test.ts`](../src/test/services/marketplace.test.ts); e2e [`e2e/walkthrough-flow.spec.ts`](../e2e/walkthrough-flow.spec.ts)

**Exit checks**

| Check | Status |
|-------|--------|
| No negative stock; reject does not reserve; accept reserves; completion needs both confirmations | Met (tests) |

**Not done (Master Plan OD-08 / scope):** Partial fulfilment, counter-offers unless explicitly approved later.

---

### Phase 6 — Field Officer system

**Goal:** Assisted entry, consent demo, verification queue, audit, QR, offline queue, same-device sync.

**Done**

- Assisted entry, consent states, approval queue ([`FieldOfficerPage`](../src/features/field-officer/FieldOfficerPage.tsx), [`fieldOfficerService.ts`](../src/features/field-officer/fieldOfficerService.ts))
- Self-approval blocked; unconsented assisted entries ineligible for average
- Offline draft + sync queue states (`DRAFT`, `PENDING_SYNC`, `SYNCING`, `SYNCED`, `FAILED`, `CONFLICT`) ([`offlineSyncService`](../src/features/field-officer/offlineSyncService.ts))
- QR uses non-sensitive `qrProfileId` only
- Tests: [`field-officer.test.ts`](../src/test/services/field-officer.test.ts), [`phase8-acceptance.test.ts`](../src/test/phase8-acceptance.test.ts)

**Exit checks**

| Check | Status |
|-------|--------|
| Unconsented assisted entry not approved/averaged; self-approval blocked; offline survives refresh | Met |

**Not done:** Cross-device or production background sync.

---

### Phase 7 — Department analytics

**Goal:** Aggregates from shared pricing service; transparent sample counts; exports.

**Done**

- Filters, official average display with scope/window/sample count ([`DepartmentAnalyticsPage`](../src/features/department/DepartmentAnalyticsPage.tsx))
- CSV / PDF / Excel export with disclaimer
- Tests: [`department-analytics.test.ts`](../src/test/services/department-analytics.test.ts)

**Exit checks**

| Check | Status |
|-------|--------|
| Shared pricing service only; no average-of-averages; sample count visible | Met |

**Partial vs Master Plan wording:** Map/heatmap may be simplified or table/chart-based in UI; all aggregates remain demo-labelled.

---

### Phase 8 — QA, hardening, and demo

**Goal:** Acceptance criteria, responsiveness, production build, deploy config, rehearsal.

**Done**

- `npm run qa` — lint (oxlint), typecheck, vitest (~82 tests), production build
- Playwright: [`e2e/smoke.spec.ts`](../e2e/smoke.spec.ts), [`e2e/walkthrough-flow.spec.ts`](../e2e/walkthrough-flow.spec.ts), CI [`.github/workflows/e2e.yml`](../.github/workflows/e2e.yml)
- Checklist: [`PHASE8_QA_CHECKLIST.md`](./PHASE8_QA_CHECKLIST.md) (automated + manual items marked complete 2026-11-05)
- SPA deploy: [`public/_redirects`](../public/_redirects), [`vercel.json`](../vercel.json)
- Walkthrough doc + e2e alignment: [`DEMO_WALKTHROUGH.md`](./DEMO_WALKTHROUGH.md)

**Exit checks**

| Check | Status |
|-------|--------|
| Master Plan acceptance themes covered by tests/checklist | Met for prototype scope |
| Production build passes | Met |

---

## Additions beyond the phase guide

Work present in the repo but not spelled out as separate phases in the Phase Guide:

| Enhancement | Location / notes |
|-------------|------------------|
| **16 demo products** with categories and Wikimedia-sourced images | [`src/data/seed/marketplaceDemo.ts`](../src/data/seed/marketplaceDemo.ts), [`public/demo-products/`](../public/demo-products/), [`scripts/fetch-demo-product-images.mjs`](../scripts/fetch-demo-product-images.mjs) |
| **Supplemental price observations** for listing-card official averages | [`listingAveragePriceSeed.ts`](../src/data/seed/listingAveragePriceSeed.ts) |
| **Cross-division demo listings** | [`marketplaceDemo.ts`](../src/data/seed/marketplaceDemo.ts) |
| **Category coverage test** (≥1 product + active listing per category) | [`marketplaceDemo.test.ts`](../src/data/seed/marketplaceDemo.test.ts) |
| **Public home / explore listing browse** with division→union + category filters | [`HomeMarketProductsSection.tsx`](../src/features/home/HomeMarketProductsSection.tsx), [`ListingCatalogFilterBar.tsx`](../src/features/marketplace/ListingCatalogFilterBar.tsx), [`marketplace-browse.test.ts`](../src/test/services/marketplace-browse.test.ts) |
| **ProductCombobox** (editable + dropdown, Popover + cmdk) | [`ProductCombobox.tsx`](../src/components/common/ProductCombobox.tsx), [`productComboboxResolve.ts`](../src/components/common/productComboboxResolve.ts) |
| **BD-JSON union merge + synthetic unions** for unmatched upazilas | [`BANGLADESH_UNION_IMPORT_STATS.json`](./BANGLADESH_UNION_IMPORT_STATS.json) (295 matched, 198 synthetic-filled) |
| **shadcn CLI path fix** (Windows `@/` folder bug) | Root [`tsconfig.json`](../tsconfig.json) `paths`; UI: [`popover.tsx`](../src/components/ui/popover.tsx), [`command.tsx`](../src/components/ui/command.tsx), dependency `cmdk` |

---

## Not implemented, partial, or deferred

### Explicitly out of prototype scope (Master Plan §2.3)

- Real SMS OTP and production authentication
- Central database, real multi-user collaboration, **cross-device sync**
- Real government price feeds; claims that demo averages are official national prices
- Online payment, legal proof of sale, real email/SMS/push delivery
- Backend API and server-side authorization
- **Voice input** — UI shows “Coming Soon” on farmer price entry ([`FarmerMarketplacePage`](../src/features/marketplace/FarmerMarketplacePage.tsx))

### Data and localization (partial)

| Item | Status |
|------|--------|
| Unions for all upazilas | **594 synthetic** unions for **198** unmatched upazilas — see [`BANGLADESH_LOCATIONS_UNVERIFIED.md`](./BANGLADESH_LOCATIONS_UNVERIFIED.md) |
| Bangla location names nationwide | Curated Bangla in demo corridor; many nodes use `nameBn` = `nameEn` fallback |
| BBS official numeric codes | Internal slugs only — see [`BANGLADESH_LOCATIONS_SOURCE.md`](./BANGLADESH_LOCATIONS_SOURCE.md) |
| Authoritative map boundaries (OD-10) | Demo location data only |

### Master Plan modules described but not fully built as separate surfaces

These are **partially** covered by existing dashboards or omitted as YAGNI for the prototype:

- Buyer “favourites” as a dedicated module
- Seller bulk purchase records as a full accounting module
- Admin: full location/product/unit CRUD, listing moderation UI, audit log browser (Admin page focuses on **schema version + reset + demo account table**)
- Department map/heatmap as a standalone production map product
- National marketing pages beyond home/explore/browse

### QA / polish deferred (engineering choice)

- ProductCombobox RTL keyboard integration test
- Dedicated shadcn onboarding doc (tsconfig paths only)
- Generic reusable `Combobox` in `src/components/ui/`
- Runtime bootstrap gate for category coverage (covered by seed test only)

---

## Open decisions (Master Plan — do not treat as final policy)

From **Master Plan v2.0, § Open Decisions**. Prototype behaviour follows “recommended prototype handling” where implemented; **project owner must confirm** before production.

| ID | Open item | Prototype handling (summary) |
|----|-----------|------------------------------|
| **OD-01** | Seller/trader observations in official average? | Farmer-linked observations only for average |
| **OD-02** | Time window: `observedAt` vs `submittedAt`? | `observedAt` added; defaults to submission when absent |
| **OD-03** | Final 24h expiry; start at approval or submission? | Configurable demo default from `approvedAt` |
| **OD-04** | Consent when farmer has no phone? | **Consent Not Available** — no invented alternative |
| **OD-05** | Anomaly threshold/method? | Configurable; demo flags illustrative |
| **OD-06** | Time-window presets? | Custom range; fixed presets after approval |
| **OD-07** | Who may cancel accepted transaction and when? | Demo cancel with reason; policy TBD |
| **OD-08** | Partial fulfilment / counter-offers? | Excluded unless approved |
| **OD-09** | Profit/loss cost categories? | Estimate from entered costs only |
| **OD-10** | Authoritative location dataset? | Labelled demo data until supplied |
| **OD-11** | Formal verification criteria for roles? | Demo statuses + audit; no legal verification claim |

Full wording: [`BazarDor_Project_Master_Plan_v2.0.docx`](./BazarDor_Project_Master_Plan_v2.0.docx).

---

## Phase 9 — Slice A (location metadata + aliases)

**Done in repo (November 2026):** Slice A — `Location.dataSource`, schema **3**, aliases, unmatched **155** (baseline 198), synthetic UI labels. **Slice B** — uncapped BD-JSON unions, JSON schema **4**. **Slice C** — Comilla/Cox’s aliases + `-s` slug fix; unmatched **109** (was 129); **3984** unions.

**Still Phase 9:** BBS from OD-10, national Bangla tree — see [Phase 9–13 roadmap](./BazarDor_Remaining_Roadmap_Phase_9_13.md).

---

## Verification commands

```bash
npm install
npm run qa                 # lint, typecheck, vitest, production build
npm run build && npm run test:e2e   # Playwright (installs Chromium via pretest:e2e)
npm run dev                # local demo
```

Before stakeholder demos after UI/seed changes: **Admin → Reset demo dataset** (schema **8**).

---

## Related documentation

- [Demo walkthrough (~15 min)](./DEMO_WALKTHROUGH.md)
- [Phase 8 QA checklist](./PHASE8_QA_CHECKLIST.md)
- [Bangladesh locations — source](./BANGLADESH_LOCATIONS_SOURCE.md)
- [Bangladesh locations — unverified / synthetic](./BANGLADESH_LOCATIONS_UNVERIFIED.md)
- [Package readme](./PACKAGE_README.txt)
- [Project README](../README.md)
- [Remaining roadmap Phase 9–13](./BazarDor_Remaining_Roadmap_Phase_9_13.md)

---

*Generated for stakeholder and handover use. Reconcile this report with the Master Plan and Phase Guide when scope or schema version changes.*
