/**
 * Spelling aliases for matching Jumman04 upazila tree to BD-JSON union keys.
 * Keys are `divKey|distKey|upzKey` after normalizeKey() on each segment.
 */

/** Normalize division/district/upazila slug for union map lookup. */
export const DIVISION_CANONICAL = {
  barisal: 'barishal',
  barishal: 'barishal',
  chattagram: 'chattogram',
  chattogram: 'chattogram',
  chittagong: 'chattogram',
}

export const DISTRICT_CANONICAL = {
  bbaria: 'brahmanbaria',
  brahmanbaria: 'brahmanbaria',
  jessore: 'jashore',
  jashore: 'jashore',
  barisal: 'barisal',
  jhalokathi: 'jhalakathi',
  jhalakathi: 'jhalakathi',
  'coxs-bazar': 'coxsbazar',
  coxsbazar: 'coxsbazar',
  cumilla: 'comilla',
  comilla: 'comilla',
}

export const UPAZILA_CANONICAL = {
  manirampur: 'monirampur',
  monirampur: 'monirampur',
  patharghata: 'pathorghata',
  pathorghata: 'pathorghata',
  charfassion: 'charfesson',
  charfasson: 'charfesson',
  borhanuddin: 'borhan-sddin',
  'borhan-sddin': 'borhan-sddin',
  'jhalokathi-s': 'jhalakathi-sadar',
  'jhalakathi-sadar': 'jhalakathi-sadar',
  mothbaria: 'mathbaria',
  mathbaria: 'mathbaria',
  tazumuddin: 'tazumuddin',
  naikhyongchari: 'naikhongchhari',
  naikhongchhari: 'naikhongchhari',
  rowangchari: 'rowangchhari',
  rowangchhari: 'rowangchhari',
  'bbaria-s': 'brahmanbaria-sadar',
  'brahmanbaria-sadar': 'brahmanbaria-sadar',
  banskhali: 'banshkhali',
  banshkhali: 'banshkhali',
  chandanish: 'chandanaish',
  chandanaish: 'chandanaish',
  fatikchari: 'fatikchhari',
  fatikchhari: 'fatikchhari',
  karnaphuli: 'karnafuli',
  karnafuli: 'karnafuli',
  raojan: 'raozan',
  raozan: 'raozan',
  faridganj: 'faridgonj',
  faridgonj: 'faridgonj',
  haziganj: 'hajiganj',
  hajiganj: 'hajiganj',
  'chandpur-s': 'chandpur-sadar',
  'chandpur-sadar': 'chandpur-sadar',
  'coxs-bazar-s': 'coxsbazar-sadar',
  'coxsbazar-sadar': 'coxsbazar-sadar',
  chakoria: 'chakaria',
  chakaria: 'chakaria',
  moheskhali: 'moheshkhali',
  moheshkhali: 'moheshkhali',
  dakshin: 'matlab-south',
  uttar: 'matlab-north',
  'matlab-south': 'matlab-south',
  'matlab-north': 'matlab-north',
  kathalia: 'kathalia',
  nalchity: 'nalchity',
  rajapur: 'rajapur',
  akhaura: 'akhaura',
  ashuganj: 'ashuganj',
  burichong: 'burichang',
  burichang: 'burichang',
  chouddagram: 'chauddagram',
  chauddagram: 'chauddagram',
  laksham: 'laksam',
  laksam: 'laksam',
  monohorganj: 'monohargonj',
  monohargonj: 'monohargonj',
  'cumilla-s': 'comilla-sadar',
  'comilla-sadar': 'comilla-sadar',
  'cumilla-s-daksin': 'sadarsouth',
  sadarsouth: 'sadarsouth',
}

/** Explicit Jumman composite key → BD composite key when segments still diverge. */
export const JUMMAN_TO_BD_UNION_LOOKUP = {
  'barishal|jhalokathi|tazumuddin': 'barishal|bhola|tazumuddin',
  'barishal|barguna|agailjhara': 'barishal|barisal|agailjhara',
  'chattogram|chandpur|dakshin': 'chattogram|chandpur|matlab-south',
  'chattogram|chandpur|uttar': 'chattogram|chandpur|matlab-north',
}

export function canonicalDivisionKey(slugOrName) {
  const s = String(slugOrName)
    .replace(/division/i, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
  return DIVISION_CANONICAL[s] ?? s
}

export function canonicalDistrictKey(slugOrName) {
  const s = String(slugOrName)
    .replace(/district/i, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
  return DISTRICT_CANONICAL[s] ?? s
}

export function canonicalUpazilaKey(slugOrName) {
  let s = String(slugOrName).trim().toLowerCase().replace(/\s+/g, '-')
  if (UPAZILA_CANONICAL[s]) return UPAZILA_CANONICAL[s]
  s = s.replace(/-S$/i, '-sadar')
  return UPAZILA_CANONICAL[s] ?? s
}

export function unionLookupKeys(divSlug, distSlug, upzSlug, rawUpzName) {
  const divs = [...new Set([divSlug, canonicalDivisionKey(divSlug)])]
  const dists = [...new Set([distSlug, canonicalDistrictKey(distSlug)])]
  const upzs = [
    ...new Set([
      upzSlug,
      canonicalUpazilaKey(upzSlug),
      canonicalUpazilaKey(rawUpzName),
    ]),
  ]
  const keys = new Set()
  for (const d of divs) {
    for (const t of dists) {
      for (const u of upzs) {
        keys.add(`${d}|${t}|${u}`)
      }
    }
  }
  for (const k of [...keys]) {
    const mapped = JUMMAN_TO_BD_UNION_LOOKUP[k]
    if (mapped) keys.add(mapped)
  }
  return [...keys]
}

/** BD-JSON side: canonical key stored in union map. */
export function bdUnionMapKey(divName, distName, upzName) {
  return `${canonicalDivisionKey(divName)}|${canonicalDistrictKey(distName)}|${canonicalUpazilaKey(upzName)}`
}
