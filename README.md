# BazarDor

Frontend-only React + Vite + TypeScript prototype (demo data, not production government services).

## Layout

- `src/` — application code
- `src/components/` — shared UI (`common/`, shadcn `ui/`)
- `documentations/` — Master Plan, phase guide, status report, location source, demo/QA walkthrough
- `public/BazarDor_SVG_Transparent_PNG_Assets/` — logo, favicon, app icon (SVG/PNG)
- `.cursor/rules/bazardor-project.mdc` — Cursor project rules

## Run

```bash
npm install
npm run dev
npm run qa          # lint, typecheck, test, build
```

Browser tests (downloads Chromium on first run via `pretest:e2e`):

```bash
npm run build && npm run test:e2e
```

## Documentation (`documentations/`)

| File | Purpose |
|------|---------|
| `BazarDor_Project_Master_Plan_v2.0.docx` | Business scope, rules, open decisions (source of truth) |
| `BazarDor_Full_Build_Setup_and_Phase_Guide_v1.0.docx` | Setup, phases 1–8, exit checks |
| `BazarDor_Simple_Data_Flow_Diagram_v2.0.docx` | Stakeholder data-flow narrative |
| `BazarDor_Implementation_Status_Report.md` | What is built vs Master Plan + remaining Phases 9–13 |
| `DEMO_WALKTHROUGH.md` | ~15 min demo script + QA checklist |
| `BANGLADESH_LOCATIONS_SOURCE.md` | Location import provenance + auto import snapshot |
| `BANGLADESH_UNION_IMPORT_STATS.json` | Union merge metrics (used by tests/build) |

Prototype guardrails: mock auth/data, no real government services or payments.
