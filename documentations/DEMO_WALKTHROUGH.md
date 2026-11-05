# BazarDor demo walkthrough and QA (~15 min)

**Before demo:** `npm run dev` (or preview production build). Optional reset: Admin → **Reset demo dataset**.

**Disclaimer:** Frontend prototype only — demo auth, sample data, no live government or payment systems.

## Walkthrough

### 1. Public home (1 min)

- Show role table and **Demo sign-in**.
- Click a **product card** → `/product/:productId` — seller count, price compare, demo phone + sale location; **View offer** → listing detail (sign-in for bid).
- Mention reset restores IndexedDB seed on this browser.

### 2. Farmer — Rahim Mia (Demo) (2 min)

- `/farmer` — submit a **price observation** (quantity, unit, total price).
- Create a **listing**; note stock fields and Demo labelling.

### 3. Buyer — Karim Traders (Demo) (2 min)

- `/buyer` — browse listings, submit an **offer** within available quantity.

### 4. Seller — Jamal Store (Demo) (2 min)

- `/seller` — **accept** one offer (reserved stock + demo transaction).
- Optionally **reject** another bid — stock unchanged.

### 5. Field officer — Sadia Rahman (Demo) (3 min)

- `/field-officer` — **assisted entry** for a farmer; show consent pending → demo verify → another officer approves (self-approval blocked).
- **Offline queue** — save draft; queue for sync; mock sync.
- **QR** — profile id only, no phone in code.

### 6. Department — Agri Analytics (Demo) (2 min)

- `/department` — filters, official average with **sample count** and window.
- Regional table; **Export CSV/PDF** — disclaimer in file.

### 7. Admin — System Admin (Demo) (1 min)

- `/admin` — storage schema version, **Reset demo dataset**, read-only browsers (locations, products, units, users, listings), **listing approve/reject** (demo).
- Handover: [`BazarDor_Implementation_Status_Report.md`](./BazarDor_Implementation_Status_Report.md).

### 8. Close (1 min)

- Run gate: `npm run qa` (and `npm run test:e2e` after `npm run build` when browser flows must pass in CI).
- Open decisions remain in Master Plan v2.0 — do not present prototype as policy.

---

## QA checklist (Phase 8+ gate)

Run `npm run qa` (lint, typecheck, test, build). Optional: `npm run build && npm run test:e2e` (CI: `.github/workflows/e2e.yml`).

After seed or catalog asset changes, **reset demo dataset** in the browser so IndexedDB matches the bundle.

**Status:** Verified via automated gate, vitest, and Playwright smoke + walkthrough (2026-11-05). Re-run manual spot checks before stakeholder demos if UI changed.

### Automated (vitest / e2e)

| Scenario | Test location |
|----------|----------------|
| Unit conversion / normalization | `src/test/services/unit-and-price.test.ts` |
| Consent + approval + self-approval block | `approval-consent.test.ts`, `field-officer.test.ts` |
| Expiry / freshness | `official-average.test.ts` |
| Latest entry, 2-farmer average, pooling | `official-average.test.ts` |
| Stock, bid, transaction flows | `marketplace.test.ts` |
| Offline queue | `field-officer.test.ts`, `phase8-acceptance.test.ts` |
| Department aggregates | `department-analytics.test.ts` |
| Route guards + permissions | `auth-guards.test.ts`, `app-shell.test.tsx` |
| Browser demo flows | `e2e/smoke.spec.ts`, `e2e/walkthrough-flow.spec.ts` |
| Seed + privacy | `phase8-acceptance.test.ts`, `domain-schemas.test.ts` |

### Manual spot checks

- **Roles:** farmer price/listing; buyer bid; seller accept/reject; field officer assisted/consent/offline/QR; department filters/export; admin reset + browsers + listing moderation.
- **UX/a11y:** mobile-width FO/farmer screens; keyboard focus; EN/BN toggle on department numbers.
- **Offline/PWA:** preview build, offline shell reload; FO offline draft in queue.
- **Privacy:** no public farmer phone; QR non-sensitive id; no real secrets in seed; Demo/Sample labels on averages and transactions.
- **Deploy:** SPA fallback (`public/_redirects`, `vercel.json`).

**Exit:** `npm run qa` passes; walkthrough rehearsed (or `e2e/walkthrough-flow.spec.ts` green).
