# BazarDor — project cleanup report

**Date:** 5 November 2026  
**Scope:** Full-repository audit, safe deletions, documentation migration `documentations/` → `docs/`, reference updates, validation.

---

## Summary

| Metric | Value |
|--------|--------|
| Files inspected (excl. `node_modules/`, `dist/`, `.git/`) | **~243** (was ~238 before new `docs/` guides) |
| Files deleted | **3** |
| `documentations/` folder | **Removed** — content under `docs/` |
| Product behaviour | **Unchanged** (doc path strings in Admin UI only) |

---

## Files deleted

| File | Reason |
|------|--------|
| `scripts/patch-bn-msgs.mjs` | One-off BN message patch script; no imports or docs references |
| `src/data/seed/demo-summary.ts` | Deprecated re-export; zero consumers |
| `src/services/index.ts` | Unused barrel; all imports target individual service modules |

---

## Documentation merged / removed

| Action | Detail |
|--------|--------|
| **Removed folder** | `documentations/` (empty after move) |
| **Already absent** | `BazarDor_Remaining_Roadmap_Phase_9_13.md`, `BANGLADESH_LOCATIONS_UNVERIFIED.md`, `PHASE8_QA_CHECKLIST.md`, `PACKAGE_README.txt` — not on disk at cleanup time; roadmap lives in `IMPLEMENTATION_STATUS.md` |
| **Renamed** | `DEMO_WALKTHROUGH.md` → `docs/DEMO_GUIDE.md` |
| **Renamed** | `BazarDor_Implementation_Status_Report.md` → `docs/IMPLEMENTATION_STATUS.md` |
| **Trimmed duplicate** | Long UI/UX subsection in `IMPLEMENTATION_STATUS.md` replaced with pointer to `UI_UX_LOCALIZATION_AUDIT_REPORT.md` and `KNOWN_LIMITATIONS.md` |
| **Split QA content** | Walkthrough script stays in `DEMO_GUIDE.md`; checklist and test inventory in new `QA_AND_TESTING.md` |
| **New guides** | `docs/README.md`, `SETUP.md`, `ARCHITECTURE.md`, `KNOWN_LIMITATIONS.md` |
| **Moved spec** | Three `.docx` files → `docs/spec/` |
| **Moved data** | `BANGLADESH_LOCATIONS_SOURCE.md`, `BANGLADESH_UNION_IMPORT_STATS.json` → `docs/` |

---

## Files intentionally retained (uncertain or by design)

| Item | Reason |
|------|--------|
| All `e2e/*.spec.ts` and `e2e/helpers.ts` | Active CI and demo coverage |
| `scripts/build-bangladesh-locations.mjs` and location helper scripts | Regenerate seed + stats JSON |
| `scripts/fetch-demo-product-images.mjs` | Documented demo asset workflow |
| `public/demo-products/*.png` | Referenced by seed and UI |
| Overlap `IMPLEMENTATION_STATUS.md` vs `UI_UX_LOCALIZATION_AUDIT_REPORT.md` | Different audiences; cross-linked, not merged into one file |
| Oxlint warnings, Vite chunk size warning | Pre-existing; documented in UI audit, not fixed in cleanup |

---

## Documentation structure after cleanup

```
docs/
  README.md
  SETUP.md
  ARCHITECTURE.md
  IMPLEMENTATION_STATUS.md
  DEMO_GUIDE.md
  QA_AND_TESTING.md
  KNOWN_LIMITATIONS.md
  UI_UX_LOCALIZATION_AUDIT_REPORT.md
  BANGLADESH_LOCATIONS_SOURCE.md
  BANGLADESH_UNION_IMPORT_STATS.json
  PROJECT_CLEANUP_REPORT.md          (this file)
  spec/
    BazarDor_Project_Master_Plan_v2.0.docx
    BazarDor_Full_Build_Setup_and_Phase_Guide_v1.0.docx
    BazarDor_Simple_Data_Flow_Diagram_v2.0.docx
```

Root [`README.md`](../README.md) points to `docs/README.md`. Cursor rules updated to `docs/spec/` paths.

---

## Code / config reference updates

- [`scripts/build-bangladesh-locations.mjs`](../scripts/build-bangladesh-locations.mjs) — writes stats and source snapshot under `docs/`
- [`src/data/bangladeshLocationHierarchy.test.ts`](../src/data/bangladeshLocationHierarchy.test.ts) — JSON import from `docs/`
- [`src/lib/i18n/messages.ts`](../src/lib/i18n/messages.ts) — `adminLocationsSourceDoc`
- [`src/features/admin/AdminDemoPage.tsx`](../src/features/admin/AdminDemoPage.tsx) — handover paths
- [`src/test/i18n-bn-no-latin.test.ts`](../src/test/i18n-bn-no-latin.test.ts) — allowlist token `docs` (was `documentations`)
- [`.cursor/rules/bazardor-project.mdc`](../.cursor/rules/bazardor-project.mdc)

Grep for `documentations/` in repo (excluding this report): **none**.

---

## Validation results (post-cleanup)

| Command | Result |
|---------|--------|
| `npm run qa` | **PASS** — oxlint warnings only; typecheck OK; **142** vitest tests; production build + PWA OK |
| `npm run build` | **PASS** (included in `qa`) |
| `npm run test:e2e` | **PASS** — **39/39** Playwright tests (~56s) |

No tests were skipped or weakened for cleanup.

---

## Remaining cleanup recommendations

1. Optional: add `@axe-core/playwright` if formal contrast/a11y gates become required (noted in UI audit).
2. Optional: second BN copy pass for remaining Latin in `MESSAGES.bn` (tracked in UI audit).
3. Regenerate location docs after import changes: `node scripts/build-bangladesh-locations.mjs` (updates `docs/BANGLADESH_*`).
4. Keep `IMPLEMENTATION_STATUS.md` gate rows aligned with `QA_AND_TESTING.md` after major test additions.

---

*Cleanup completed without changing BazarDor business rules, routes, seed behaviour, or localization logic beyond documentation path strings.*
