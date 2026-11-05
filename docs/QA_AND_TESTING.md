# QA and testing

## Phase 8+ gate

```bash
npm run qa
npm run build && npm run test:e2e   # optional; required for CI browser coverage
```

After seed or catalog asset changes, **reset demo dataset** in the browser (Admin) so IndexedDB matches the bundle.

Stakeholder script: [DEMO_GUIDE.md](./DEMO_GUIDE.md).

## Automated — vitest

| Scenario | Test location |
|----------|----------------|
| Unit conversion / normalization | `src/test/services/unit-and-price.test.ts` |
| Consent + approval + self-approval block | `approval-consent.test.ts`, `field-officer.test.ts` |
| Expiry / freshness | `official-average.test.ts` |
| Latest entry, 2-farmer average, pooling | `official-average.test.ts` |
| Stock, bid, transaction flows | `marketplace.test.ts` |
| Seller offer selection → bid `listingId` | `listingOfferEligibility.test.ts`, `product-seller-offer-selection.test.ts` |
| Offline queue | `field-officer.test.ts`, `phase8-acceptance.test.ts` |
| Department aggregates | `department-analytics.test.ts` |
| Route guards + permissions | `auth-guards.test.ts`, `app-shell.test.tsx` |
| i18n parity / BN guards | `src/test/i18n-*.test.ts(x)` |
| Seed + privacy | `phase8-acceptance.test.ts`, `domain-schemas.test.ts` |
| Location hierarchy | `src/data/bangladeshLocationHierarchy.test.ts`, `src/services/bangladeshLocationHierarchy.test.ts` |

## Automated — Playwright (`e2e/`)

| Spec | Focus |
|------|--------|
| `smoke.spec.ts` | Public home, login, role landing |
| `walkthrough-flow.spec.ts` | Multi-role demo path |
| `role-product-cards.spec.ts` | Product cards / inventory tab |
| `responsive-layout.spec.ts` | Viewports 375–1440 |
| `bangla-walkthrough.spec.ts` | BN locale role tabs |
| `accessibility.spec.ts` | Focus, labels, keyboard basics |

Helpers: [`e2e/helpers.ts`](../e2e/helpers.ts).

## Manual spot checks (before demos)

- **Roles:** farmer price/listing; buyer **select offer on product detail** then bid; seller accept/reject; field officer assisted/consent/offline/QR; department filters/export; admin reset + browsers + listing moderation.
- **UX/a11y:** mobile FO/farmer; keyboard focus; EN/BN toggle on formatted numbers.
- **Offline/PWA:** preview build, shell reload; FO offline draft in queue.
- **Privacy:** no public farmer phone; QR non-sensitive id; Demo/Sample labels on averages and transactions.

## UI / UX audit evidence

Detailed results: [UI_UX_LOCALIZATION_AUDIT_REPORT.md](./UI_UX_LOCALIZATION_AUDIT_REPORT.md).

## Exit criteria

- `npm run qa` passes.
- Walkthrough rehearsed or `e2e/walkthrough-flow.spec.ts` green.
- Open decisions **OD-01 … OD-11** not presented as final policy ([KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md)).
