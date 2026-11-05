/**
 * Rebuild src/data/bangladesh-locations.json
 * Upazila tree: Jumman04 bd-dd-ui-en.JSON
 * Unions: sohag-pro/BD-JSON bd.json (see documentations/BANGLADESH_LOCATIONS_SOURCE.md)
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  bdUnionMapKey,
  unionLookupKeys,
} from './bangladesh-location-aliases.mjs'
import { resolveBanglaName } from './bangladesh-location-bn-overrides.mjs'

const JUMMAN_URL =
  'https://raw.githubusercontent.com/Jumman04/Bangladesh-Divisions-Districts-and-Upazilas-Information/main/bd-dd-ui-en.JSON'
const BD_JSON_URL = 'https://raw.githubusercontent.com/sohag-pro/BD-JSON/master/bd.json'
const SYNTHETIC_UNIONS_PER_UPAZILA = 3
const BASELINE_UNMATCHED = 198
const SLICE_A_UNMATCHED = 155
const SLICE_B_UNMATCHED = 129
const SLICE_C_UNMATCHED = 109
const SLICE_D_UNMATCHED = 94

const SAMPLE_UNION_BN = ['১', '২', '৩', '৪', '৫']

function slugify(name) {
  return name
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function normalizeUpazilaRaw(raw) {
  return raw.replace(/-S$/i, ' Sadar').trim()
}

function upazilaName(entry) {
  if (typeof entry === 'string') return entry
  if (entry && typeof entry.name === 'string') return entry.name
  throw new Error(`Unexpected upazila entry: ${JSON.stringify(entry).slice(0, 80)}`)
}

const DEMO_UNIONS = [
  {
    parentUpazilaKey: 'khulna|jashore|keshabpur',
    id: 'bd-uni-khulna-jashore-keshabpur-ghona',
    nameEn: 'Ghona Union',
    nameBn: 'ঘোনা ইউনিয়ন',
    demoCentroid: { lat: 23.08, lng: 89.26 },
  },
  {
    parentUpazilaKey: 'khulna|jashore|monirampur',
    id: 'bd-uni-khulna-jashore-monirampur-durgapur',
    nameEn: 'Durgapur Union',
    nameBn: 'দুর্গাপুর ইউনিয়ন',
    demoCentroid: { lat: 23.0, lng: 89.24 },
  },
]

const DEMO_CENTROIDS = {
  'bd-div-khulna': { lat: 22.81, lng: 89.55 },
  'bd-dist-khulna-jashore': { lat: 23.17, lng: 89.21 },
  'bd-upz-khulna-jashore-keshabpur': { lat: 23.09, lng: 89.27 },
  'bd-upz-khulna-jashore-monirampur': { lat: 23.01, lng: 89.23 },
}

function displayNameEn(raw, type) {
  const base = normalizeUpazilaRaw(raw)
  if (type === 'division' && !/division/i.test(base)) return `${base} Division`
  if (type === 'district' && !/district/i.test(base)) return `${base} District`
  if (type === 'upazila' && !/upazila/i.test(base)) return `${base} Upazila`
  if (type === 'union' && !/union/i.test(base)) return `${base} Union`
  return base
}

function buildBdJsonUnionMap(bdDivisions) {
  const map = new Map()
  for (const div of bdDivisions) {
    for (const dist of div.districts ?? []) {
      for (const upz of dist.upazilas ?? []) {
        const lookup = bdUnionMapKey(div.name, dist.name, upz.name)
        map.set(lookup, upz.unions ?? [])
      }
    }
  }
  return map
}

function importUnionsIntoUpazila(upzNode, divSlug, distSlug, upzSlug, rawUpzName, unionsFromBd, existingIds) {
  const tryKeys = unionLookupKeys(divSlug, distSlug, upzSlug, rawUpzName)
  let unions = []
  for (const k of tryKeys) {
    const list = unionsFromBd.get(k)
    if (list?.length) {
      unions = list
      break
    }
  }
  if (!unions.length) {
    return { matched: false, added: 0 }
  }

  const sorted = [...unions].sort((a, b) => String(a.name).localeCompare(String(b.name)))
  let added = 0
  for (const uni of sorted) {
    const uniSlug = slugify(uni.name)
    const id = `bd-uni-${divSlug}-${distSlug}-${upzSlug}-${uniSlug}`
    if (existingIds.has(id) || upzNode.children.some((c) => c.id === id)) continue
    existingIds.add(id)
    upzNode.children.push({
      id,
      type: 'union',
      nameEn: displayNameEn(uni.name, 'union'),
      nameBn: uni.bn_name ?? uni.name,
      dataSource: 'bd_json',
      children: [],
    })
    added += 1
  }
  return { matched: true, added }
}

function addSyntheticUnionsForEmptyUpazilas(upazilaKeyToNode, stats) {
  for (const [key, upzNode] of upazilaKeyToNode) {
    if (upzNode.children.length > 0) continue
    addSyntheticUnionSamples(key, upzNode, stats, SYNTHETIC_UNIONS_PER_UPAZILA, 1)
    stats.upazilasFilledWithSynthetic += 1
  }
}

function addSyntheticUnionSamples(key, upzNode, stats, count, startIndex) {
  const [divSlug, distSlug, upzSlug] = key.split('|')
  if (!divSlug || !distSlug || !upzSlug) return
  for (let i = 0; i < count; i += 1) {
    const sampleNum = startIndex + i
    const slug = `sample-${sampleNum}`
    const id = `bd-uni-${divSlug}-${distSlug}-${upzSlug}-${slug}`
    if (upzNode.children.some((c) => c.id === id)) continue
    upzNode.children.push({
      id,
      type: 'union',
      nameEn: `Sample Union ${sampleNum} (Demo)`,
      nameBn: `নমুনা ইউনিয়ন ${SAMPLE_UNION_BN[sampleNum - 1] ?? String(sampleNum)} (ডেমো)`,
      dataSource: 'demo_synthetic',
      children: [],
    })
    stats.syntheticUnionsAdded += 1
  }
}

/** Matched upazilas may import fewer than 3 unions from BD-JSON; pad with demo_synthetic samples. */
function ensureMinimumUnionsPerUpazila(upazilaKeyToNode, stats, minimum = 3) {
  for (const [key, upzNode] of upazilaKeyToNode) {
    const deficit = minimum - upzNode.children.length
    if (deficit <= 0) continue
    const used = upzNode.children
      .map((c) => {
        const m = c.id.match(/-sample-(\d+)$/)
        return m ? Number(m[1]) : 0
      })
      .filter((n) => n > 0)
    const startIndex = used.length ? Math.max(...used) + 1 : 1
    addSyntheticUnionSamples(key, upzNode, stats, deficit, startIndex)
  }
}

function recountUnionCoverage(upazilaKeyToNode, stats) {
  stats.upazilasWithAtLeast1Union = 0
  stats.upazilasWithAtLeast3Unions = 0
  stats.unionsImported = 0
  for (const upzNode of upazilaKeyToNode.values()) {
    const n = upzNode.children.length
    stats.unionsImported += n
    if (n >= 1) stats.upazilasWithAtLeast1Union += 1
    if (n >= 3) stats.upazilasWithAtLeast3Unions += 1
  }
}

function walkTree(n, counts, bnFallback) {
  counts[n.type] = (counts[n.type] ?? 0) + 1
  if (n.type !== 'union' && n.nameBn === n.nameEn) bnFallback.adminEnFallback += 1
  for (const c of n.children ?? []) walkTree(c, counts, bnFallback)
}

function writeUnverifiedDoc(stats, counts, bnFallback, generatedAt) {
  const lines = [
    '# Bangladesh admin locations — unverified / omitted (Phase 1+)',
    '',
    '## Unions (BD-JSON import)',
    '',
    'Unions are merged from [sohag-pro/BD-JSON](https://github.com/sohag-pro/BD-JSON) `bd.json` when upazila names align with the Jumman04 tree. **Not claimed as live BBS verification in the UI.**',
    '',
    `Latest import stats: [\`BANGLADESH_UNION_IMPORT_STATS.json\`](./BANGLADESH_UNION_IMPORT_STATS.json) (regenerated ${generatedAt} by \`node scripts/build-bangladesh-locations.mjs\`).`,
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| \`upazilasTotal\` | ${stats.upazilasTotal} |`,
    `| \`upazilasMatched\` | ${stats.upazilasMatched} |`,
    `| \`upazilasUnmatched\` | ${stats.upazilasUnmatched} |`,
    `| \`unionsImported\` | ${stats.unionsImported} |`,
    `| \`syntheticUnionsAdded\` | ${stats.syntheticUnionsAdded} |`,
    `| \`upazilasFilledWithSynthetic\` | ${stats.upazilasFilledWithSynthetic} |`,
    `| Phase 9 baseline unmatched | ${BASELINE_UNMATCHED} (target: lower after alias pass) |`,
    '',
    '**Named demo corridor unions (centroids for map):**',
    '',
    '| Union ID | Parent upazila |',
    '|----------|----------------|',
    '| `bd-uni-khulna-jashore-keshabpur-ghona` | Keshabpur |',
    '| `bd-uni-khulna-jashore-monirampur-durgapur` | Monirampur |',
    '',
    '## Synthetic sample unions',
    '',
    'When BD-JSON cannot match an upazila, the build script adds **three** unions per gap:',
    '',
    '- IDs: `bd-uni-{div}-{dist}-{upz}-sample-1` … `sample-3`',
    '- `dataSource`: `demo_synthetic` — **not** verified government data.',
    '',
    'Regenerate via `node scripts/build-bangladesh-locations.mjs`. Policy in [`BANGLADESH_LOCATIONS_SOURCE.md`](./BANGLADESH_LOCATIONS_SOURCE.md).',
    '',
    '## Tree counts (generated)',
    '',
    `| Level | Count |`,
    `|-------|-------|`,
    `| division | ${counts.division ?? 0} |`,
    `| district | ${counts.district ?? 0} |`,
    `| upazila | ${counts.upazila ?? 0} |`,
    `| union | ${counts.union ?? 0} |`,
    '',
    `Admin nodes with Bangla fallback (\`nameBn === nameEn\`): **${bnFallback.adminEnFallback}** (div/district/upazila only).`,
    '',
    '## Unmatched samples (up to 15)',
    '',
    ...(stats.unmatchedSamples.length
      ? stats.unmatchedSamples.map((id) => `- \`${id}\``)
      : ['- _(none)_']),
    '',
    '## Upazila naming quirks (Jumman04 source)',
    '',
    '- Some rows use a `-S` suffix (e.g. `Jashore-S`) normalized to “Sadar” in display English names.',
    '- Division spelling: Jumman `Barishal` vs BD-JSON `Barisal` — canonicalized in `scripts/bangladesh-location-aliases.mjs`.',
    '',
  ]
  const docPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'documentations', 'BANGLADESH_LOCATIONS_UNVERIFIED.md')
  writeFileSync(docPath, lines.join('\n') + '\n', 'utf8')
}

async function main() {
  const [jRes, bdRes] = await Promise.all([fetch(JUMMAN_URL), fetch(BD_JSON_URL)])
  if (!jRes.ok) throw new Error(`Jumman04 fetch failed: ${jRes.status}`)
  if (!bdRes.ok) throw new Error(`BD-JSON fetch failed: ${bdRes.status}`)
  const data = await jRes.json()
  const bdDivisions = await bdRes.json()
  const divisions = data.divisions ?? data
  if (!Array.isArray(divisions) || divisions.length !== 8) {
    throw new Error(`Expected 8 divisions, got ${divisions?.length}`)
  }

  const unionsFromBd = buildBdJsonUnionMap(bdDivisions)
  const upazilaKeyToNode = new Map()
  const existingUnionIds = new Set()
  const importStats = {
    upazilasTotal: 0,
    upazilasMatched: 0,
    upazilasUnmatched: 0,
    upazilasWithAtLeast1Union: 0,
    upazilasWithAtLeast3Unions: 0,
    unionsImported: 0,
    syntheticUnionsAdded: 0,
    upazilasFilledWithSynthetic: 0,
    unmatchedSamples: [],
    phase9BaselineUnmatched: BASELINE_UNMATCHED,
    phase9SliceAUnmatched: SLICE_A_UNMATCHED,
    phase9SliceBUnmatched: SLICE_B_UNMATCHED,
    phase9SliceCUnmatched: SLICE_C_UNMATCHED,
    phase9SliceDUnmatched: SLICE_D_UNMATCHED,
  }

  const children = divisions.map((div) => {
    const divSlug = slugify(div.name)
    const divId = `bd-div-${divSlug}`
    const divBn = resolveBanglaName(divId, div.name)
    return {
      id: divId,
      type: 'division',
      nameEn: displayNameEn(div.name, 'division'),
      nameBn: divBn,
      dataSource: 'jumman04',
      ...(DEMO_CENTROIDS[divId] ? { demoCentroid: DEMO_CENTROIDS[divId] } : {}),
      children: (div.districts ?? []).map((dist) => {
        const distSlug = slugify(dist.name)
        const distId = `bd-dist-${divSlug}-${distSlug}`
        const distBn = resolveBanglaName(distId, dist.name)
        return {
          id: distId,
          type: 'district',
          nameEn: displayNameEn(dist.name, 'district'),
          nameBn: distBn,
          dataSource: 'jumman04',
          ...(DEMO_CENTROIDS[distId] ? { demoCentroid: DEMO_CENTROIDS[distId] } : {}),
          children: (dist.upazilas ?? []).map((upzEntry) => {
            const rawName = upazilaName(upzEntry)
            const upzSlug = slugify(rawName)
            const upzId = `bd-upz-${divSlug}-${distSlug}-${upzSlug}`
            const key = `${divSlug}|${distSlug}|${upzSlug}`
            const upzBn = resolveBanglaName(upzId, rawName)
            const upzNode = {
              id: upzId,
              type: 'upazila',
              nameEn: displayNameEn(rawName, 'upazila'),
              nameBn: upzBn,
              dataSource: 'jumman04',
              ...(DEMO_CENTROIDS[upzId] ? { demoCentroid: DEMO_CENTROIDS[upzId] } : {}),
              children: [],
            }
            upazilaKeyToNode.set(key, upzNode)
            importStats.upazilasTotal += 1

            const result = importUnionsIntoUpazila(
              upzNode,
              divSlug,
              distSlug,
              upzSlug,
              rawName,
              unionsFromBd,
              existingUnionIds,
            )
            if (result.matched) importStats.upazilasMatched += 1
            else {
              importStats.upazilasUnmatched += 1
              if (importStats.unmatchedSamples.length < 15) importStats.unmatchedSamples.push(upzId)
            }
            return upzNode
          }),
        }
      }),
    }
  })

  for (const uni of DEMO_UNIONS) {
    const parent = upazilaKeyToNode.get(uni.parentUpazilaKey)
    if (!parent) throw new Error(`Demo union parent not found: ${uni.parentUpazilaKey}`)
    if (!parent.children.some((c) => c.id === uni.id)) {
      parent.children.unshift({
        id: uni.id,
        type: 'union',
        nameEn: uni.nameEn,
        nameBn: uni.nameBn,
        dataSource: 'demo_corridor',
        demoCentroid: uni.demoCentroid,
        children: [],
      })
      existingUnionIds.add(uni.id)
    }
  }

  addSyntheticUnionsForEmptyUpazilas(upazilaKeyToNode, importStats)
  ensureMinimumUnionsPerUpazila(upazilaKeyToNode, importStats)
  recountUnionCoverage(upazilaKeyToNode, importStats)

  const generatedAt = new Date().toISOString().slice(0, 10)
  const out = {
    schemaVersion: 4,
    source: JUMMAN_URL,
    unionSource: BD_JSON_URL,
    generatedAt,
    idScheme: 'bd-div-* | bd-dist-{div}-{dist} | bd-upz-{div}-{dist}-{upz} | bd-uni-{div}-{dist}-{upz}-{uni}',
    dataSourceLegend: {
      jumman04: 'Division/district/upazila tree from Jumman04 English file',
      bd_json: 'Union from BD-JSON where upazila names match (full list per upazila)',
      demo_corridor: 'Curated demo unions with centroids',
      demo_synthetic: 'Placeholder Sample Union (Demo) — not government verification',
    },
    unionImportStats: importStats,
    note:
      'Phase 9 Slice B: full BD-JSON union import per matched upazila; dataSource on every node; bbsCode/officialId reserved until OD-10.',
    divisions: children,
  }

  const root = dirname(fileURLToPath(import.meta.url))
  const target = join(root, '..', 'src', 'data', 'bangladesh-locations.json')
  const statsPath = join(root, '..', 'documentations', 'BANGLADESH_UNION_IMPORT_STATS.json')
  writeFileSync(target, JSON.stringify(out, null, 2) + '\n', 'utf8')
  writeFileSync(statsPath, JSON.stringify(importStats, null, 2) + '\n', 'utf8')

  const counts = { division: 0, district: 0, upazila: 0, union: 0 }
  const bnFallback = { adminEnFallback: 0 }
  for (const d of children) walkTree(d, counts, bnFallback)
  writeUnverifiedDoc(importStats, counts, bnFallback, generatedAt)

  console.log('Wrote', target, counts, importStats)
  if (importStats.upazilasUnmatched >= BASELINE_UNMATCHED) {
    console.warn(
      `upazilasUnmatched ${importStats.upazilasUnmatched} (baseline ${BASELINE_UNMATCHED}) — add aliases in bangladesh-location-aliases.mjs`,
    )
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
