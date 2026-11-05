# Architecture and data flow

## Prototype shape

- **Presentation:** React pages under `src/features/`, layouts under `src/layouts/`, shared UI under `src/components/`.
- **Application / state:** React Router ([`src/app/router/`](../src/app/router/)), Redux ([`src/app/store/`](../src/app/store/)), locale preferences ([`src/app/preferences/`](../src/app/preferences/)).
- **Business logic:** Pure TypeScript in [`src/services/`](../src/services/) (pricing, consent, approval, stock, official average, etc.).
- **Data access:** Repository interfaces in [`src/data/repositories/`](../src/data/repositories/); mock IndexedDB adapters in [`src/data/adapters/`](../src/data/adapters/).
- **Storage:** LocalStorage for demo session/preferences; IndexedDB for domain records and offline sync queue (same browser/device only).

Components and pages do **not** read or write storage directly — use repositories, hooks, and services.

## Stakeholder narrative

See [Simple Data Flow Diagram v2.0](./spec/BazarDor_Simple_Data_Flow_Diagram_v2.0.docx).

## Price domains (non-negotiable)

`officialMarketPrice`, `askingPrice`, and `biddingPrice` stay separate. Official averages use eligible farmer observations only — see Master Plan and [`src/services/officialMarketPriceService.ts`](../src/services/officialMarketPriceService.ts).

## Bangladesh locations

- Seed JSON: [`src/data/bangladesh-locations.json`](../src/data/bangladesh-locations.json)
- Regenerate: `node scripts/build-bangladesh-locations.mjs`
- Provenance: [BANGLADESH_LOCATIONS_SOURCE.md](./BANGLADESH_LOCATIONS_SOURCE.md)

## Related

- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)
- [`.cursor/rules/bazardor-project.mdc`](../.cursor/rules/bazardor-project.mdc)
