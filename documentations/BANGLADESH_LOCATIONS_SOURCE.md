# Bangladesh administrative locations — data source (Phase 9 Slice A)

## Primary source

| Field | Value |
|-------|--------|
| Dataset | [Jumman04 — Bangladesh Divisions, Districts and Upazilas Information](https://github.com/Jumman04/Bangladesh-Divisions-Districts-and-Upazilas-Information) |
| File used | `bd-dd-ui-en.JSON` (English hierarchy) |
| Retrieved | Regenerate via `node scripts/build-bangladesh-locations.mjs` |
| Levels imported | 8 divisions, 64 districts, 493 upazilas, unions via BD-JSON merge |
| JSON `schemaVersion` | **4** (Slice B: uncapped union import) |

## Union source

| Field | Value |
|-------|--------|
| Dataset | [sohag-pro/BD-JSON](https://github.com/sohag-pro/BD-JSON) |
| File | `bd.json` |
| Merge | `node scripts/build-bangladesh-locations.mjs` (**full** BD-JSON union list per matched upazila) |
| Alias table | `scripts/bangladesh-location-aliases.mjs` (division/district/upazila; Comilla `cumilla`→`comilla`, Cox’s `-s` slug fix) |
| Stats | `documentations/BANGLADESH_UNION_IMPORT_STATS.json` |
| Unverified report | `documentations/BANGLADESH_LOCATIONS_UNVERIFIED.md` (auto-refreshed on build) |

**Synthetic gaps:** upazilas with no BD-JSON match get `Sample Union (Demo)` nodes (`dataSource: demo_synthetic`, ids ending in `-sample-*`). The location selector appends an extra Demo sample hint for those unions only.

## `dataSource` values (provenance)

| Value | Meaning |
|-------|---------|
| `jumman04` | Division, district, or upazila from the Jumman04 English tree |
| `bd_json` | Union imported from BD-JSON where the upazila name matched |
| `demo_corridor` | Curated demo unions with map centroids (Ghona, Durgapur — Khulna/Jashore corridor) |
| `demo_synthetic` | Placeholder sample unions — **not** government-verified data |

Reserved until OD-10 / official dataset (left empty in JSON today):

- `officialId` — external registry id
- `bbsCode` — BBS code (do **not** invent values)
- `mapBoundaryId` — future boundary hook (no GeoJSON in repo yet)

## Internal ID scheme (BazarDor prototype)

These IDs are **application-internal slugs**, not claimed to match BBS official numeric codes unless explicitly mapped later.

| Level | Pattern | Example |
|-------|---------|---------|
| Division | `bd-div-{slug}` | `bd-div-khulna` |
| District | `bd-dist-{divSlug}-{distSlug}` | `bd-dist-khulna-jashore` |
| Upazila | `bd-upz-{divSlug}-{distSlug}-{upzSlug}` | `bd-upz-khulna-jashore-keshabpur` |
| Union | `bd-uni-{div}-{dist}-{upz}-{uni}` | From BD-JSON where matched; `sample-1`… when unmatched |

Slugs are derived from English names in the source file (lowercase, hyphenated).

## Bengali labels

- Incremental overrides: `scripts/bangladesh-location-bn-overrides.mjs` (8 divisions + demo corridor).
- Remaining admin nodes keep `nameBn = nameEn` until a verified EN/BN-aligned join is imported (counts in build log / UNVERIFIED report).

## Demo storage note

`STORAGE_SCHEMA_VERSION` was bumped when `Location` gained `dataSource`. After pulling this slice, **reset the demo dataset** in the app if IndexedDB locations look stale.

## Regeneration

```bash
node scripts/build-bangladesh-locations.mjs
```

Commit `src/data/bangladesh-locations.json` after verification (division count = 8, district count = 64, upazila count = 493).
