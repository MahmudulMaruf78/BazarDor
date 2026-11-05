/**
 * Download homepage hero photos from Unsplash (pinned photo pages + license).
 * Re-run: node scripts/fetch-home-hero-images.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const UA = 'BazarDorDemo/1.0 (prototype hero assets; local dev)'

/** filename → Unsplash download URL (photo id in scripts + docs/HERO_PHOTOGRAPHY.md) */
const FILES = {
  'hero-primary.jpg': 'https://unsplash.com/photos/vraKTroWlbY/download?w=1920&force=true',
  'hero-primary-mobile.jpg': 'https://unsplash.com/photos/vraKTroWlbY/download?w=900&fit=crop&crop=entropy&force=true',
  'hero-supporting.jpg': 'https://unsplash.com/photos/oTtL2Z-4i1s/download?w=1280&force=true',
}

async function download(url, dest) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': UA },
  })
  if (!res.ok) throw new Error(`${url} → ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(dest, buf)
  console.log('wrote', dest, buf.length)
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'home-hero')
mkdirSync(outDir, { recursive: true })

for (const [name, url] of Object.entries(FILES)) {
  await download(url, join(outDir, name))
}
