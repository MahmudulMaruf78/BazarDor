# BazarDor

Frontend-only React + Vite + TypeScript prototype (demo data, not production government services).

## Layout

- `src/` — application code
- `src/components/` — shared UI (`common/`, shadcn `ui/`)
- `documentations/` — Master Plan, phase guide, data-flow doc, package readme
- `public/BazarDor_SVG_Transparent_PNG_Assets/` — logo, favicon, app icon (SVG/PNG)
- `.cursor/rules/bazardor-project.mdc` — Cursor project rules

## Run

```bash
npm install
npm run dev
```

Browser tests (downloads Chromium on first run via `pretest:e2e`):

```bash
npm run build && npm run test:e2e
```

## Docs

See [documentations/PACKAGE_README.txt](./documentations/PACKAGE_README.txt).
