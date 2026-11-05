# BazarDor demo walkthrough and QA (~15 min)

**Before demo:** `npm run dev` (or preview production build). Optional reset: Admin → **Reset demo dataset**.

**Disclaimer:** Frontend prototype only — demo auth, sample data, no live government or payment systems.

## Walkthrough

### 1. Public home (1 min)

- Show role table and **Demo sign-in**.
- Click a **product card** → `/product/:productId` — seller count, price compare, demo phone + sale location; **Select this offer** then **Submit offer on selected listing** (bid uses that exact `listingId`, not showcase only). **View offer** → listing detail.
- **Variants (demo):** Home/marketplace browse may show **two Granola Potato cards** (standard vs premium demo grade) — open each; detail lists **only sellers for that variant**. Premium potato card shows **2 sellers** in full catalog search.
- Mention reset restores IndexedDB seed on this browser (schema v3 includes `productVariants`).

### 2. Farmer — Rahim Mia (Demo) (2 min)

- `/farmer` — submit a **price observation** (quantity, unit, total price).
- Create a **listing**; note stock fields and Demo labelling.

### 3. Buyer — Karim Traders (Demo) (2 min)

- `/buyer` — browse **one card per product/variant** (showcase price is display-only).
- Open **Compare sellers** on a product → pick **Select this offer** → submit offer on that listing only.
- Browse tab has no quick **Offer** button without seller selection.

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
- Handover: [`IMPLEMENTATION_STATUS.md`](./IMPLEMENTATION_STATUS.md).

### 8. Close (1 min)

- Run gate: `npm run qa` (and `npm run test:e2e` after `npm run build` when browser flows must pass in CI).
- Open decisions remain in [Master Plan v2.0](./spec/BazarDor_Project_Master_Plan_v2.0.docx) — do not present prototype as policy.

---

## QA checklist (Phase 8+ gate)

Run `npm run qa` (lint, typecheck, test, build). Optional: `npm run build && npm run test:e2e` (CI: `.github/workflows/e2e.yml`). Full checklist: [`QA_AND_TESTING.md`](./QA_AND_TESTING.md).
