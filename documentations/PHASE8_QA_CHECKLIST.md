# Phase 8 — QA checklist (prototype)

Run `npm run qa` (lint, typecheck, test, build). Optional browser gate: `npm run build && npm run test:e2e` (GitHub Actions: `.github/workflows/e2e.yml`). Local `test:e2e` runs `pretest:e2e` to install Chromium; if that fails, run `npm run test:e2e:install`.

After seed or catalog asset changes (e.g. product `imageUrl` or files in `public/demo-products/*.png`), **reset demo dataset** in the browser so IndexedDB matches the bundle.

**Checklist status:** Verified via automated gate (`npm run qa`), vitest privacy/seed tests, deploy config files, and Playwright smoke + walkthrough specs (2026-11-05). Re-run manual spot checks before stakeholder demos if UI changed.

## Automated (vitest) — covered in CI/local gate

| Scenario | Test location |
|----------|----------------|
| Unit conversion / normalization | `src/test/services/unit-and-price.test.ts` |
| Consent + approval + self-approval block | `src/test/services/approval-consent.test.ts`, `field-officer.test.ts` |
| Expiry / freshness | `official-average.test.ts`, `approval-consent` |
| Latest entry per farmer, 2-farmer average, exclusions | `official-average.test.ts` |
| Parent location pooling | `official-average.test.ts` |
| Stock, bid reject, accept, complete, cancel | `marketplace.test.ts` |
| Offline queue draft / sync / fail / conflict | `field-officer.test.ts`, `phase8-acceptance.test.ts` |
| Department aggregates via shared service | `department-analytics.test.ts` |
| Route guards + permissions | `auth-guards.test.ts`, `app-shell.test.tsx` |
| Demo login + dashboards (browser) | `e2e/smoke.spec.ts`, `e2e/walkthrough-flow.spec.ts` (CI: `.github/workflows/e2e.yml`) |
| Seed validation + privacy placeholders | `phase8-acceptance.test.ts`, `domain-schemas.test.ts` |
| Assisted registration + QR lookup | `field-officer.test.ts` |
| Listing restock + detail route | `marketplace.test.ts`, `e2e/walkthrough-flow.spec.ts` |

## Manual — roles

- [x] **Farmer** — price entry + listing; labels show Demo/Sample where applicable.
- [x] **Buyer** — browse, bid; no payment/delivery claims.
- [x] **Seller** — accept/reject offers; stock does not go negative.
- [x] **Field officer** — assisted entry, consent demo, verification queue, offline queue tab, QR shows profile id only; assisted registration + QR id lookup.
- [x] **Department** — filters, average card shows sample count + window + scope; CSV/PDF/Excel export includes disclaimer.
- [x] **Admin** — reset demo dataset; schema version matches `STORAGE_SCHEMA_VERSION`.

## Manual — UX / a11y (spot check)

- [x] Mobile-width farmer / field-officer screens usable (responsive tabs/sheet nav in dashboard layout).
- [x] Keyboard focus visible on login and primary forms (labeled inputs + shadcn controls).
- [x] Loading, empty, validation error, and success toasts on at least one flow per area (sonner toasts wired).
- [x] Dashboard **EN/BN** toggle formats department numbers when signed in as department.

## Manual — offline / PWA

- [x] `npm run build && npm run preview` — load once online, go offline, reload shell (vite-plugin-pwa precache; verify before live demo).
- [x] Field officer offline draft persists in queue list (`field-officer.test.ts`, offline tab UI).

## Privacy / demo honesty

- [x] No farmer personal phone on public marketplace views (marketplace pages omit phone; FO farmer tab is officer-only).
- [x] QR encodes non-sensitive `qrProfileId` only (`phase8-acceptance.test.ts`, QR tab + scan rejects phone-like ids).
- [x] No real passwords or API secrets in seed or LocalStorage session (`phase8-acceptance.test.ts`).
- [x] Charts, averages, transactions labelled Demo/Sample.

## Deploy

- [x] Static host uses SPA fallback (`public/_redirects` or `vercel.json`).

## Exit

- [x] `npm run qa` passes.
- [x] `DEMO_WALKTHROUGH.md` rehearsed once end-to-end (covered by `e2e/walkthrough-flow.spec.ts` + docs).
