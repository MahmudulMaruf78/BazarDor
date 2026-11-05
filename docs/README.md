# BazarDor documentation

Frontend-only React + Vite + TypeScript prototype (demo data — not production government services).

## Authoritative specifications (`spec/`)

| Document | Purpose |
|----------|---------|
| [BazarDor_Project_Master_Plan_v2.0.docx](./spec/BazarDor_Project_Master_Plan_v2.0.docx) | Business scope, rules, open decisions **OD-01 … OD-11** (source of truth) |
| [BazarDor_Full_Build_Setup_and_Phase_Guide_v1.0.docx](./spec/BazarDor_Full_Build_Setup_and_Phase_Guide_v1.0.docx) | Phases 1–8, setup, exit checks |
| [BazarDor_Simple_Data_Flow_Diagram_v2.0.docx](./spec/BazarDor_Simple_Data_Flow_Diagram_v2.0.docx) | Stakeholder data-flow narrative |

## Project guides

| Document | Purpose |
|----------|---------|
| [SETUP.md](./SETUP.md) | Install, dev, QA, e2e, demo reset |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Layers, data flow, key `src/` paths |
| [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) | Built vs Master Plan; phases 9–13 roadmap |
| [DEMO_GUIDE.md](./DEMO_GUIDE.md) | ~15 min stakeholder walkthrough |
| [QA_AND_TESTING.md](./QA_AND_TESTING.md) | Checklists, vitest/e2e, CI |
| [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md) | Demo scope, location data gaps, open decisions |
| [UI_UX_LOCALIZATION_AUDIT_REPORT.md](./UI_UX_LOCALIZATION_AUDIT_REPORT.md) | UI/UX and Bangla audit (2026-11-05) |
| [BANGLADESH_LOCATIONS_SOURCE.md](./BANGLADESH_LOCATIONS_SOURCE.md) | Location import provenance (not fully verified official data) |
| [PROJECT_CLEANUP_REPORT.md](./PROJECT_CLEANUP_REPORT.md) | Nov 2026 cleanup audit and validation |

## Code layout

- `src/` — application
- `public/` — static assets, demo product images
- `.cursor/rules/bazardor-project.mdc` — Cursor project rules

Root [README](../README.md) — quick start.
