# Homepage hero photography

Prototype hero images for the public home page. **Not government official imagery.**

Re-download pinned Unsplash assets:

```bash
node scripts/fetch-home-hero-images.mjs
```

Paths are wired in [`src/constants/home-hero-assets.ts`](../../src/constants/home-hero-assets.ts).

| File | Role | Unsplash photo |
|------|------|----------------|
| `hero-primary.jpg` | Primary hero (desktop, ~1920px wide) | [vraKTroWlbY](https://unsplash.com/photos/vraKTroWlbY) |
| `hero-primary-mobile.jpg` | Primary hero (≤767px, ~900px wide crop) | Same photo, smaller download |
| `hero-supporting.jpg` | Supporting alternate (not shown in hero UI today) | [oTtL2Z-4i1s](https://unsplash.com/photos/oTtL2Z-4i1s) |

## License

Both photos are used under the [Unsplash License](https://unsplash.com/license) for this **demo prototype** only. Verify photographer credit on each Unsplash page before any production or marketing use outside the prototype.

Full concept evaluation and implementation notes: [`docs/HERO_PHOTOGRAPHY.md`](../HERO_PHOTOGRAPHY.md).

Legacy UI mockup JPGs (`hero-1.jpg` … `hero-3.jpg`) may remain on disk from earlier iterations; they are **not referenced in code**.
