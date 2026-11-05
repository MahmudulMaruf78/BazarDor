# BazarDor — UI/UX & Bangla Localization Audit Report

**Audit date:** 2026-11-05  
**Scope:** Frontend prototype (`src/`), automated checks, Playwright e2e, unit/integration tests for business rules  
**Auditor mode:** QA + fix confirmed defects (no redesign)

---

## 1. Overall audit result

| Area | Status | Notes |
|------|--------|-------|
| Agricultural design system | **PARTIAL** | Shared shells, green `primary` tokens, product imagery on cards; not every admin/legacy block restyled to identical density |
| Bangla localization | **PASS** (automated) | Key parity, BN Latin guardrails, hardcoded UI scan, role-page smoke; manual full-app BN walk not repeated this session |
| English localization | **PASS** | EN keys drive UI; locale toggle verified in unit tests |
| Page coverage vs checklist | **PARTIAL** | All **routed** pages audited; many checklist items are **single-route tab panels**, not separate URLs |
| Responsive (375–1440) | **PASS** | Playwright `e2e/responsive-layout.spec.ts` — overflow + role routes |
| Accessibility | **PARTIAL** | Playwright `e2e/accessibility.spec.ts`; color contrast not tool-scanned |
| Business logic regression | **PASS** | Covered by existing unit tests in `npm run qa` |
| `npm run qa` | **PASS** | See §13 |
| `npm run test:e2e` | **PASS** | **39/39** tests (smoke, walkthrough, responsive, BN, a11y) |

---

## 2. Agricultural theme audit

**PASS (core)**  
- CSS `--primary` green (~oklch 155° hue) in `src/index.css`.  
- Public hero band, `RoleWorkspaceShell`, `WorkspaceSampleNotice`, `EmptyState` / `LoadingState`, `ListingProductCard` with product images.  
- Dashboard/public layouts use consistent spacing and card borders (no heavy gradients in audited paths).

**PARTIAL**  
- Department charts and admin tables use standard shadcn tables (acceptable for stakeholders; not a bespoke “agricultural” table skin everywhere).  
- Some oxlint warnings on set-state-in-effect (unchanged; not visual regressions).

**FAIL**  
- None blocking prototype demo.

---

## 3. Bangla localization audit

**Automated (PASS)**  
- `src/test/i18n-messages.test.ts` — EN/BN key parity, error inventory.  
- `src/test/i18n-bn-no-latin.test.ts` — BN message Latin allowlist.  
- `src/test/i18n-hardcoded-ui.test.ts` — user-facing JSX string denylist.  
- `src/test/i18n-role-pages-smoke.test.tsx` — role routes render without English chrome when locale is BN.  
- `src/test/i18n-locale-switch.test.tsx` — toggle without navigation.  
- `src/test/i18n-locale-persistence.test.tsx` — **added this audit**; `bazardor.preferences.v1` stores `locale: "bn"`.

**Manual BN pass (browser-automated)**  
- **PASS** — `e2e/bangla-walkthrough.spec.ts`: public `/`, `/explore`, `/product/prod-potato`; all six role dashboards **every tab**; buyer listing detail; EN restore after toggle. Denylist scan for common English chrome strings.

**Fixes applied**  
- Farmer voice control: `title={t('voiceComingSoon')}` (was hardcoded `Coming Soon`).  
- Login: removed duplicate `pickAccount` line from `AuthLayout` (kept on `DemoLoginPage` only).

**Known acceptable English in BN mode**  
- Demo user names, product codes, IDs, `{name}`/`{count}` template placeholders, chart numeric ticks, allowlisted Latin in BN messages per test file.

---

## 4. English localization audit

**PASS**  
- `LocaleSwitcher` EN button restores EN strings (unit test).  
- E2e flows run with default EN UI.

---

## 5. Page-by-page results

Legend: **PASS** = routed UI present, i18n wired, no audit blockers | **PARTIAL** = tabs subsume checklist | **NOT IMPLEMENTED** = no route/module

### Public

| Page | Status | Route / notes |
|------|--------|----------------|
| Home | PASS | `/` |
| Explore | PASS | `/explore` |
| Product category browsing | PASS | Explore + home sections |
| Product detail | PASS | `/product/:productId` |
| Seller price comparison | PARTIAL | On product detail / compare service; not separate URL |
| Listing detail | PASS | `/listing/:listingId` |

### Farmer (`/farmer` — tabbed workspace)

| Checklist item | Status |
|----------------|--------|
| Overview | PASS (`tabOverview`) |
| Price observations | PASS (market price tab/panel) |
| Product listings | PASS |
| Stock management | PARTIAL (quantities on listings; no dedicated stock page) |
| Offers | PARTIAL (buyer bids via marketplace flow) |
| Transactions | PARTIAL (embedded in workspace) |
| Profile | NOT IMPLEMENTED (no `/farmer/profile`) |

### Buyer (`/buyer`)

| Checklist item | Status |
|----------------|--------|
| Overview | PASS |
| Product discovery / browse | PASS (`tabBrowse`) |
| Search and filters | PASS |
| Price comparison | PARTIAL (cards + official avg on listings) |
| Offers / bids | PASS (`tabBids`) |
| Transactions | PASS (confirm in bids/transactions UI) |

### Seller (`/seller`)

| Checklist item | Status |
|----------------|--------|
| Overview | PASS |
| Inventory | PASS (`tabInventory`) |
| Listings | PASS (create via inventory/bulk forms) |
| Bulk purchase records | PARTIAL (form on inventory tab) |
| Offers | PASS (`tabOffers`) |
| Sales history | PASS (`tabSales`) |

### Field Officer (`/field-officer`)

| Checklist item | Status |
|----------------|--------|
| Overview | PASS |
| Assisted registration | PASS |
| Farmer records | PASS |
| Price verification | PASS (`tabVerify`) |
| Approval queue | PASS |
| Consent | PASS |
| Offline queue | PASS |
| QR lookup | PASS |

### Agriculture Department (`/department`)

| Checklist item | Status |
|----------------|--------|
| Analytics | PASS |
| Official market prices | PASS |
| Regional comparisons | PASS |
| Trends | PASS |
| Reports / exports | PASS (demo export labels) |

### Admin (`/admin`)

| Checklist item | Status |
|----------------|--------|
| User management | PASS |
| Role management | NOT IMPLEMENTED |
| Officer management | NOT IMPLEMENTED |
| Location management | PASS |
| Product / category management | PASS |
| Unit management | PASS |
| Listing moderation | PASS |
| Audit logs | NOT IMPLEMENTED |
| Settings | PARTIAL (`AdminDemoPage` system/docs tabs only) |

### Auth / errors

| Page | Status |
|------|--------|
| Demo login | PASS |
| Access denied | PASS |
| Not found | PASS |

---

## 6. Responsive test results

Executed via **`e2e/responsive-layout.spec.ts`** against production preview (`127.0.0.1:4173`).

| Viewport | Public routes | Six role dashboards | FO all tabs | Buyer BN browse |
|----------|---------------|---------------------|-------------|-----------------|
| 375px | **PASS** | **PASS** | **PASS** | **PASS** |
| 390px | **PASS** | **PASS** | **PASS** | **PASS** |
| 768px | **PASS** | **PASS** | **PASS** | **PASS** |
| 1366px | **PASS** | **PASS** | **PASS** | **PASS** |
| 1440px | **PASS** | **PASS** | **PASS** | **PASS** |

**Method:** `document.documentElement` / `main` horizontal overflow ≤2px slack; routes `/`, `/explore`, `/product/prod-potato`; signed-in farmer, buyer, seller, field officer, department, admin.

**Fixes applied after failures:** `overflow-x-clip` on public/dashboard shells; `min-w-0` on dashboard content; mobile sheet **Sign out** + home link; corrected e2e `setLocale('en')` helper logic.

**Not individually scripted:** every admin sub-tab, every modal open state, chart resize at each width (layout shell PASS only).

---

## 7. Accessibility findings

Executed via **`e2e/accessibility.spec.ts`** (Playwright + accessibility snapshot API).

| Check | Status | Evidence |
|-------|--------|----------|
| Keyboard navigation | **PARTIAL** | Tab loop reaches focusable control with visible ring on home |
| Focus visible | **PASS** | Focused link/button shows outline or box-shadow |
| Input labels | **PASS** | Login combobox + Continue button roles/names |
| Button names | **PASS** | Locale group `aria-label`; sheet close sr-only `close` key |
| Color contrast | **NOT TESTED** | No axe/Lighthouse run in CI |
| Heading hierarchy | **PASS** | Department route: one `h1`, `main` landmark |
| Dialog / sheet | **PASS** | Mobile nav sheet close control named; FO/desktop dialogs use Radix |
| Error messages | **PASS** | `translateError` + BN inventory unit tests |

**Fix:** Mobile dashboard had no sign-out until sheet footer added (usability + keyboard path).

---

## 8. Business logic regression tests

All run via `npm run qa` (Vitest). **PASS** for rules audited via tests:

| Rule | Test location (representative) |
|------|--------------------------------|
| Official avg eligibility, min 2 farmers, latest per farmer | `src/test/services/official-average.test.ts` |
| Geographic pooling (not avg-of-avgs) | `official-average.test.ts`, `listingAveragePriceSeed.test.ts` |
| Unit normalization / kg | `src/test/services/unit-and-price.test.ts` |
| Consent / approval / self-approval block | `src/test/services/approval-consent.test.ts`, `field-officer.test.ts` |
| Stock reserve / release / completion | `src/test/services/marketplace.test.ts`, `stock-anomaly.test.ts` |
| Bids ≠ official price | marketplace + snapshot tests |

No business policy changes made during this audit.

---

## 9. Issues discovered

1. Duplicate login copy → Playwright strict mode failure (`pickAccount` twice).  
2. E2e helpers matched ambiguous login text.  
3. E2e smoke explore link ambiguous (hero + nav).  
4. E2e seller heading stale vs `sellerTitle`.  
5. E2e walkthrough did not open buyer **Browse** / seller **Offers** / **Inventory** tabs after overview default.  
6. E2e listing detail assertion used wrong official-price label string.  
7. Farmer voice button English `title="Coming Soon"`.  
8. Missing audit report file.  
9. No automated locale persistence test (gap).  
10. **Final pass:** Mobile `<md` had no sign-out control.  
11. **Final pass:** Tablet 768px horizontal overflow (~7px) on dashboard content.  
12. **Final pass:** E2e `setLocale('en')` helper never clicked EN after BN (false-negative toggle).

---

## 10. Issues fixed

| # | Fix |
|---|-----|
| 1 | Removed extra `pickAccount` from `AuthLayout.tsx` |
| 2 | `e2e/helpers.ts` — wait for combobox; drop broad text match |
| 3 | `e2e/smoke.spec.ts` — nav-scoped explore link; combobox visibility on login |
| 4 | `e2e/role-product-cards.spec.ts` — inventory tab + `sellerTitle` copy |
| 5–6 | `e2e/walkthrough-flow.spec.ts` — tab navigation + `officialMarketAvg` copy |
| 7 | `FarmerMarketplacePage.tsx` — `voiceComingSoon` |
| 8 | This report |
| 9 | `src/test/i18n-locale-persistence.test.tsx` |
| 10 | `DashboardLayout.tsx` — mobile sheet sign-out + public home |
| 11 | `PublicLayout.tsx` / `DashboardLayout.tsx` — `overflow-x-clip`, `min-w-0` |
| 12 | `e2e/helpers.ts` — `setLocale` fix; `signOutDemo`; overflow helper |
| 13 | `e2e/responsive-layout.spec.ts`, `e2e/bangla-walkthrough.spec.ts`, `e2e/accessibility.spec.ts` |

---

## 11. Remaining issues and limitations

- **Color contrast:** not measured (add `@axe-core/playwright` or Lighthouse CI if required).  
- **Keyboard:** full app tab order not manually walked page-by-page.  
- **BN walkthrough:** automated denylist + tab sweep; demo user names and product codes remain Latin by design.  
- **Admin:** role management, officer management, audit logs not in prototype scope.  
- **Separate profile/stock URLs:** not implemented (tabbed workspaces).  
- **Lint:** oxlint warnings only (no errors).  
- **Bundle size:** Vite chunk >500 kB warning (pre-existing).

---

## 12. Files created or modified (this audit)

**Created (final pass)**  
- `e2e/responsive-layout.spec.ts`  
- `e2e/bangla-walkthrough.spec.ts`  
- `e2e/accessibility.spec.ts`

**Modified (final pass)**  
- `src/layouts/dashboard-layout/DashboardLayout.tsx`  
- `src/layouts/public-layout/PublicLayout.tsx`  
- `e2e/helpers.ts` (extended)

---

## 13. Verification command results

### `npm run qa` — **PASS** (2026-11-05)

```
npm run lint && npm run typecheck && npm test && npm run build
```

- **Lint:** oxlint warnings only (fast-refresh, set-state-in-effect, exhaustive-deps).  
- **Typecheck:** pass.  
- **Vitest:** 34 files, **133 tests passed**.  
- **Build:** Vite production build + PWA precache succeeded.

### `npm run build`

Included in `qa` above — **PASS**.

### `npm run test:e2e` — **PASS** (2026-11-05 final)

```
Running 39 tests using 3 workers
  39 passed (~56s)
```

Suites: `smoke`, `walkthrough-flow`, `role-product-cards`, `responsive-layout`, `bangla-walkthrough`, `accessibility`.

---

## 14. Completion statement

Initial audit fixes (i18n leak, login copy, e2e tab flows) plus **final browser verification** complete. Responsive matrix **PASS** at 375–1440 via Playwright. BN walkthrough **PASS** (automated browser, all role tabs). Accessibility **PARTIAL** (keyboard/focus/labels/sheet/dialog checked; contrast not tool-scanned). **39** e2e + **133** unit tests green. Prototype scope unchanged (missing admin modules documented).
