# BazarDor demo walkthrough (~15 min)

**Before demo:** `npm run dev` (or preview production build). Optional reset: Admin → **Reset demo dataset**.

**Disclaimer:** Frontend prototype only — demo auth, sample data, no live government or payment systems.

## 1. Public home (1 min)

- Show role table and **Demo sign-in**.
- Mention reset restores IndexedDB seed on this browser.

## 2. Farmer — Rahim Mia (Demo) (2 min)

- `/farmer` — submit a **price observation** (quantity, unit, total price).
- Create a **listing**; note stock fields and Demo labelling.

## 3. Buyer — Karim Traders (Demo) (2 min)

- `/buyer` — browse listings, submit an **offer** within available quantity.

## 4. Seller — Jamal Store (Demo) (2 min)

- `/seller` — **accept** one offer (reserved stock + demo transaction).
- Optionally **reject** another bid — stock unchanged.

## 5. Field officer — Sadia Rahman (Demo) (3 min)

- `/field-officer` — **assisted entry** for a farmer; show consent pending → demo verify → another officer approves (self-approval blocked).
- **Offline queue** — save draft; queue for sync; mock sync.
- **QR** — profile id only, no phone in code.

## 6. Department — Agri Analytics (Demo) (2 min)

- `/department` — filters, official average with **sample count** and window.
- Regional table; **Export CSV/PDF** — disclaimer in file.

## 7. Admin — System Admin (Demo) (1 min)

- `/admin` — storage schema version, **Reset demo dataset**, demo account table.
- Point to `PHASE8_QA_CHECKLIST.md` for stakeholders.

## 8. Close (1 min)

- Run gate: `npm run qa` (and `npm run test:e2e` after `npm run build` when browser flows must pass in CI).
- Open decisions remain in Master Plan v2.0 — do not present prototype as policy.
