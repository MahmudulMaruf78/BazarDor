# Known limitations and open decisions

This prototype is **demo-only**. Do not claim real government approval, live market feeds, payments, cross-device sync, or fully verified national location data.

## Explicitly out of scope

- Real SMS OTP and production authentication
- Central database, cross-device synchronization
- Real government price feeds; demo averages are **not** official national prices
- Online payment, legal proof of sale, real notifications
- Backend API and server-side authorization
- **Voice input** on farmer price entry — UI shows “Coming Soon”

## Location data (partial)

| Item | Status |
|------|--------|
| Division / district / upazila tree | Imported from public datasets — see [BANGLADESH_LOCATIONS_SOURCE.md](./BANGLADESH_LOCATIONS_SOURCE.md) |
| Unions | BD-JSON merge + **synthetic demo unions** for unmatched upazilas |
| Bangla names nationwide | Many nodes use `nameBn` = `nameEn` fallback |
| BBS official numeric codes | Internal slugs only |
| Map boundaries (**OD-10**) | Demo data until an authoritative dataset is supplied |

Regenerate import stats: `node scripts/build-bangladesh-locations.mjs`.

## Open decisions (OD-01 … OD-11)

Prototype uses **provisional defaults** where implemented. **Project owner must confirm** before production. Full wording: [Master Plan v2.0](./spec/BazarDor_Project_Master_Plan_v2.0.docx).

| ID | Open item | Prototype handling (summary) |
|----|-----------|------------------------------|
| **OD-01** | Seller/trader observations in official average? | Farmer-linked observations only |
| **OD-02** | Time window: `observedAt` vs `submittedAt`? | `observedAt`; defaults to submission when absent |
| **OD-03** | Final 24h expiry; start at approval or submission? | Configurable demo default from `approvedAt` |
| **OD-04** | Consent when farmer has no phone? | **Consent Not Available** — no invented alternative |
| **OD-05** | Anomaly threshold/method? | Configurable; demo flags illustrative |
| **OD-06** | Time-window presets? | Custom range; fixed presets after approval |
| **OD-07** | Who may cancel accepted transaction and when? | Demo cancel with reason; policy TBD |
| **OD-08** | Partial fulfilment / counter-offers? | Excluded unless approved |
| **OD-09** | Profit/loss cost categories? | Estimate from entered costs only |
| **OD-10** | Authoritative location dataset? | Labelled demo data until supplied |
| **OD-11** | Formal verification criteria for roles? | Demo statuses + audit; no legal verification claim |

## Related

- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) — phase gaps and roadmap
- [UI_UX_LOCALIZATION_AUDIT_REPORT.md](./UI_UX_LOCALIZATION_AUDIT_REPORT.md) — localization and UX gaps
