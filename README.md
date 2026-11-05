# BazarDor

Frontend-only React + Vite + TypeScript prototype (demo data, not production government services).

## Layout

- `src/` — application code
- `src/components/` — shared UI (`common/`, shadcn `ui/`)
- `docs/` — specifications, status, setup, QA, location source ([index](./docs/README.md))
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

## Documentation

See **[docs/README.md](./docs/README.md)** for the full index. Authoritative business rules live in **`docs/spec/BazarDor_Project_Master_Plan_v2.0.docx`**.

Prototype guardrails: mock auth/data, no real government services or payments.
