# Demo product photos (marketing)

Replace files in place or re-run `node scripts/fetch-demo-product-images.mjs` (Wikimedia Commons sources pinned in that script).

| File | Product id |
|------|------------|
| `paddy.png` | `prod-paddy` |
| `rice-milled.png` | `prod-rice-milled` |
| `potato.png` | `prod-potato` |
| `onion.png` | `prod-onion` |
| `tomato.png` | `prod-tomato` |
| `brinjal.png` | `prod-brinjal` |
| `chili.png` | `prod-chili` |
| `mustard.png` | `prod-mustard` |
| `mango.png` | `prod-mango` |
| `banana.png` | `prod-banana` |
| `lentil.png` | `prod-lentil` |
| `garlic.png` | `prod-garlic` |
| `ginger.png` | `prod-ginger` |
| `cabbage.png` | `prod-cabbage` |
| `cucumber.png` | `prod-cucumber` |
| `turmeric.png` | `prod-turmeric` |

Paths are wired in [`src/constants/demo-product-assets.ts`](../../src/constants/demo-product-assets.ts).

Use ~640px-wide JPEG bytes saved as `.png` filenames (browser decodes by content). Label shoots as demo/sample — not government official imagery.

After swapping assets, **reset demo dataset** in the app (`STORAGE_SCHEMA_VERSION` bump) so IndexedDB catalog matches seed.

## Attribution

Images are downloaded from [Wikimedia Commons](https://commons.wikimedia.org/) for prototype demo only. Each file title is listed in [`scripts/fetch-demo-product-images.mjs`](../../scripts/fetch-demo-product-images.mjs). Check each file’s Commons page for author and license before production use.

**WebP:** optional future optimization; static paths in code are the source of truth today (no `<picture>` in `ProductImage` yet).
