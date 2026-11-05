/**
 * Download demo product photos from Wikimedia Commons (API-resolved URLs).
 * Re-run: node scripts/fetch-demo-product-images.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Local filename → Commons file title (see README for licenses) */
const FILES = {
  'paddy.png': 'File:Rice_grains_(IRRI).jpg',
  'rice-milled.png': 'File:Long_grain_rice.jpg',
  'potato.png': 'File:Potato.jpg',
  'onion.png': 'File:Onions.jpg',
  'tomato.png': 'File:Tomato_je.jpg',
  'brinjal.png': 'File:Aubergine.jpg',
  'chili.png': 'File:Chili_pepper.jpg',
  'mustard.png': 'File:Mustard_plant.jpg',
  'mango.png': 'File:Hapus_Mango.jpg',
  'banana.png': 'File:Banana-Single.jpg',
  'lentil.png': 'File:Lentil_soup.jpg',
  'garlic.png': 'File:Garlic.jpg',
  'ginger.png': 'File:Ginger_root.jpg',
  'cabbage.png': 'File:Cabbage_and_cross_section_on_white.jpg',
  'cucumber.png': 'File:Cucumber.jpg',
  'turmeric.png': 'File:Curcuma_longa_roots.jpg',
}

const UA = 'BazarDorDemo/1.0 (prototype demo seed; contact: local dev)'

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function commonsThumb640(title) {
  const api =
    'https://commons.wikimedia.org/w/api.php?action=query&titles=' +
    encodeURIComponent(title) +
    '&prop=imageinfo&iiprop=url&iiurlwidth=640&format=json'
  const res = await fetch(api, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`API ${title}: ${res.status}`)
  const text = await res.text()
  if (text.startsWith('You are making')) throw new Error(`Rate limited: ${title}`)
  const json = JSON.parse(text)
  const page = json.query.pages[Object.keys(json.query.pages)[0]]
  if (page.missing) throw new Error(`Missing commons file: ${title}`)
  const info = page.imageinfo?.[0]
  const url = (info?.thumburl ?? info?.url)?.split('?')[0]
  if (!url) throw new Error(`No image URL: ${title}`)
  return url
}

async function main() {
  const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'demo-products')
  mkdirSync(outDir, { recursive: true })
  for (const [name, title] of Object.entries(FILES)) {
    await sleep(1500)
    const url = await commonsThumb640(title)
    await sleep(300)
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    writeFileSync(join(outDir, name), buf)
    console.log('Wrote', name, buf.length)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
