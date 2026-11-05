# Bangladesh admin locations — unverified / omitted (Phase 1+)

## Unions (BD-JSON import)

Unions are merged from [sohag-pro/BD-JSON](https://github.com/sohag-pro/BD-JSON) `bd.json` when upazila names align with the Jumman04 tree. **Not claimed as live BBS verification in the UI.**

Latest import stats: [`BANGLADESH_UNION_IMPORT_STATS.json`](./BANGLADESH_UNION_IMPORT_STATS.json) (regenerated 2026-11-05 by `node scripts/build-bangladesh-locations.mjs`).

| Metric | Value |
|--------|-------|
| `upazilasTotal` | 493 |
| `upazilasMatched` | 407 |
| `upazilasUnmatched` | 86 |
| `unionsImported` | 4059 |
| `syntheticUnionsAdded` | 259 |
| `upazilasFilledWithSynthetic` | 86 |
| Phase 9 baseline unmatched | 198 (target: lower after alias pass) |

**Named demo corridor unions (centroids for map):**

| Union ID | Parent upazila |
|----------|----------------|
| `bd-uni-khulna-jashore-keshabpur-ghona` | Keshabpur |
| `bd-uni-khulna-jashore-monirampur-durgapur` | Monirampur |

## Synthetic sample unions

When BD-JSON cannot match an upazila, the build script adds **three** unions per gap:

- IDs: `bd-uni-{div}-{dist}-{upz}-sample-1` … `sample-3`
- `dataSource`: `demo_synthetic` — **not** verified government data.

Regenerate via `node scripts/build-bangladesh-locations.mjs`. Policy in [`BANGLADESH_LOCATIONS_SOURCE.md`](./BANGLADESH_LOCATIONS_SOURCE.md).

## Tree counts (generated)

| Level | Count |
|-------|-------|
| division | 8 |
| district | 64 |
| upazila | 493 |
| union | 4059 |

Admin nodes with Bangla fallback (`nameBn === nameEn`): **0** (div/district/upazila only).

## Unmatched samples (up to 15)

- `bd-upz-barishal-bhola-daulatkhan`
- `bd-upz-barishal-patuakhali-mirjaganj`
- `bd-upz-chattogram-khagrachari-guimara`
- `bd-upz-chattogram-laxmipur-laxmipur-s`
- `bd-upz-dhaka-gazipur-kaliakoir`
- `bd-upz-dhaka-gopalganj-kasiani`
- `bd-upz-dhaka-gopalganj-kotwalipara`
- `bd-upz-dhaka-kishoreganj-karimganj`
- `bd-upz-dhaka-manikganj-daulatpur`
- `bd-upz-dhaka-manikganj-ghior`
- `bd-upz-dhaka-manikganj-shivalaya`
- `bd-upz-dhaka-manikganj-singair`
- `bd-upz-dhaka-munshiganj-gazaria`
- `bd-upz-dhaka-munshiganj-lauhajong`
- `bd-upz-dhaka-narshingdi-belabo`

## Upazila naming quirks (Jumman04 source)

- Some rows use a `-S` suffix (e.g. `Jashore-S`) normalized to “Sadar” in display English names.
- Division spelling: Jumman `Barishal` vs BD-JSON `Barisal` — canonicalized in `scripts/bangladesh-location-aliases.mjs`.

