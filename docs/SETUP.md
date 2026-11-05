# Setup and development

## Prerequisites

- Node.js (LTS recommended)
- npm

## Install and run

```bash
npm install
npm run dev
```

Production preview:

```bash
npm run build
npm run preview
```

## Quality gate

```bash
npm run qa          # lint, typecheck, vitest, production build
```

Browser tests (Chromium installed on first run via `pretest:e2e`):

```bash
npm run build && npm run test:e2e
```

CI: [`.github/workflows/e2e.yml`](../.github/workflows/e2e.yml).

## Demo dataset reset

After pulling seed or schema changes, use **Admin → Reset demo dataset** so browser IndexedDB matches the bundle (`STORAGE_SCHEMA_VERSION` in [`src/constants/storage.ts`](../src/constants/storage.ts)).

## Phase order

Implementation phases and exit checks: [Full Build Phase Guide](./spec/BazarDor_Full_Build_Setup_and_Phase_Guide_v1.0.docx).

## Deploy (SPA)

- [`public/_redirects`](../public/_redirects)
- [`vercel.json`](../vercel.json)

## Related

- [QA_AND_TESTING.md](./QA_AND_TESTING.md)
- [DEMO_GUIDE.md](./DEMO_GUIDE.md)
