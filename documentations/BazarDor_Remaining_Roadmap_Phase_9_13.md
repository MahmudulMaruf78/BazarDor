# BazarDor — Remaining Development Roadmap (Phase 9–13)

| Status | Phases |
|--------|--------|
| **Completed** | Phase 1–8 — prototype scope per [Full Build Phase Guide](./BazarDor_Full_Build_Setup_and_Phase_Guide_v1.0.docx) and [Implementation Status Report](./BazarDor_Implementation_Status_Report.md) |
| **Remaining** | Phase 9–13 below |

**How to use with Cursor:** One phase per agent session. After each phase: review diff → `npm run qa` → optional `npm run build && npm run test:e2e` → short completion note → next phase.

**Prototype guardrails (always):** Frontend-only; mock repositories + IndexedDB; no real backend/SMS/payment; do not invent Master Plan policy — see OD-01…OD-11. Details: [`.cursor/rules/bazardor-project.mdc`](../.cursor/rules/bazardor-project.mdc).

---

## Phase 9 — Bangladesh location data completion

**Priority:** Very high  

**Goal:** Complete, trustworthy administrative location system for the prototype (still labelled demo unless OD-10 supplies official dataset).

**Tasks**

1. Verify Bangla + English names for all divisions.
2. Verify district names and parent relationships.
3. Verify upazila names and parent relationships.
4. Collect and verify real union names (replace placeholders).
5. Replace **198 upazilas’ synthetic unions** with verified data where possible ([`BANGLADESH_UNION_IMPORT_STATS.json`](./BANGLADESH_UNION_IMPORT_STATS.json) — 594 synthetic today).
6. Add **official BBS location codes** (separate from internal slugs).
7. Keep **internal ID** and **official ID** distinct on [`Location`](../src/types/domain/records.ts).
8. Validate location search and cascading selectors ([`BangladeshLocationSelector`](../src/components/common/BangladeshLocationSelector.tsx), [`build-bangladesh-locations.mjs`](../scripts/build-bangladesh-locations.mjs)).
9. Prepare for map boundary data (e.g. optional GeoJSON / centroid metadata — not survey-grade claims).
10. Maintain unverified-location report ([`BANGLADESH_LOCATIONS_UNVERIFIED.md`](./BANGLADESH_LOCATIONS_UNVERIFIED.md)).

**Completion criteria**

- No synthetic union presented as verified government data (explicit `source` / `isDemoSynthetic` or equivalent in data + UI labels).
- Regenerate `src/data/bangladesh-locations.json`; bump `STORAGE_SCHEMA_VERSION` if IndexedDB shape changes; users reset demo dataset.

**Current hooks:** `scripts/build-bangladesh-locations.mjs`, `SYNTHETIC_UNIONS_PER_UPAZILA = 3`, union merge from BD-JSON.

---

## Phase 10 — Admin management system

**Priority:** Very high  

**Goal:** Admin can manage the **demo system** from the existing dashboard shell — **no new backend**.

**Modules (extend [`AdminDemoPage`](../src/features/admin/AdminDemoPage.tsx) pattern: repos, permissions, shadcn UI)**

| Module | Scope |
|--------|--------|
| User management | List, search, filter, view, edit demo user status |
| Role management | Roles and permission keys (prototype) |
| Farmer verification | Demo verification statuses + audit |
| Seller verification | Same |
| Officer management | Create/edit officers, assign region |
| Location management | CRUD divisions–unions (IndexedDB + seed sync rules) |
| Product management | Categories, products, varieties |
| Unit management | kg, maund, quintal, tonne + `kgPerUnit` |
| Listing moderation | Approve/reject listings (demo) |
| Audit log | Important actions history |
| System settings | Demo config (schema version, labels) |

**Rules:** Reuse layered architecture — UI → services → repository interfaces → mock adapters. Never bypass repos from components.

---

## Phase 11 — Missing marketplace and business features

**Priority:** High  

**Goal:** Master Plan modules not yet built as dedicated surfaces (see Implementation Status Report § partial).

**Buyer:** Favourites, saved listings, favourite sellers, purchase history UX  

**Seller:** Bulk purchase records, purchase/selling history, stock UX, profit/loss estimates (OD-09 scope)  

**Marketplace:** Advanced search, category UX, location comparison, moderation hooks, availability display  

**Transaction:** History, status tracking, cancellation reason, reserved vs available stock (keep existing stock rules)

**Rules:** Bids/transactions must not change official market price; demo labels remain.

---

## Phase 12 — Department analytics and reporting

**Priority:** High  

**Goal:** Richer regional analytics for Agriculture Department demo.

**Tasks:** Division/district/upazila/union comparisons; interactive map/heatmap demo; product trends; history; demand/supply summaries; anomaly highlighting (configurable, OD-05); CSV/Excel/PDF improvements; always show sample count, time window, location scope.

**Non-negotiable:** All averages via [`officialMarketPriceService`](../src/services/officialMarketPriceService.ts) — no average-of-averages; pool descendant records per Master Plan.

---

## Phase 13 — Final QA, security readiness and handover

**Priority:** Final  

**Goal:** Stakeholder-ready prototype demonstration.

**Checks:** E2E per role; responsive; EN/BN; location graph; seed; price/consent/approval; transactions/stock; offline queue; privacy; a11y spot check; performance smoke; build/deploy; updated docs; walkthrough rehearsal.

```bash
npm run qa
npm run build
npm run test:e2e
```

Extends [`PHASE8_QA_CHECKLIST.md`](./PHASE8_QA_CHECKLIST.md).

---

## Open business decisions (parallel — not a dev phase)

Project Owner must confirm before treating prototype defaults as production policy. Full list: Master Plan OD-01…OD-11 — summarized in [Implementation Status Report](./BazarDor_Implementation_Status_Report.md#open-decisions-master-plan--do-not-treat-as-final-policy).

| ID | Topic |
|----|--------|
| OD-01 | Seller/trader observations in official average |
| OD-02 | `observedAt` vs `submittedAt` for time window |
| OD-03 | 24h expiry start (approval vs submission) |
| OD-04 | Consent without farmer phone |
| OD-05 | Anomaly threshold |
| OD-06 | Time-window presets |
| OD-07 | Transaction cancellation policy |
| OD-08 | Partial fulfilment / counter-offers |
| OD-09 | Profit/loss cost categories |
| OD-10 | Authoritative location dataset |
| OD-11 | Formal role verification |

---

## Recommended order

1. Phase 9 — Location data  
2. Phase 10 — Admin system  
3. Phase 11 — Marketplace features  
4. Phase 12 — Department analytics  
5. Phase 13 — Final QA and handover  

Resolve or explicitly defer OD items that block Phase 9–10 design (especially **OD-10**, **OD-11**, product/unit policy).

---

## Agent checklist (every phase)

- [ ] Scope matches phase section only (YAGNI)
- [ ] Business rules in `src/services/`, not in React components
- [ ] Tests for new rules; update seed/tests if schema changes
- [ ] `npm run qa` green before phase sign-off
- [ ] Update Implementation Status Report or phase completion note if behaviour changed materially
