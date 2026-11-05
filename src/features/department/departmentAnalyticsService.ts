import { dataLayer } from '@/data'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'
import { PRODUCT_CARD_CALCULATED_AT } from '@/services/productCardMarketSnapshot'
import { calculateOfficialMarketAverage } from '@/services/officialMarketPriceService'
import type { MarketAverageQuery, OfficialAverageResult } from '@/services/types'
import type { Location, Product } from '@/types/domain/records'
import { ok, type RepositoryResult } from '@/types/result'

export type DepartmentFilters = {
  productId: string
  locationScopeId: string
  windowStart: string
  windowEnd: string
  calculatedAt: string
}

export type TrendPoint = {
  label: string
  result: OfficialAverageResult
}

export type RegionalRow = {
  locationId: string
  locationName: string
  result: OfficialAverageResult
}

export type TrendGranularity = 'day' | 'week' | 'month'

export type ActivitySummary = {
  activeListings: number
  transactionCount: number
  approvedPriceEntries: number
}

export async function loadDepartmentCatalog(): Promise<
  RepositoryResult<{ products: Product[]; locations: Location[] }>
> {
  const [products, locations] = await Promise.all([
    dataLayer.repos.catalog.listProducts(),
    dataLayer.repos.catalog.listLocations(),
  ])
  if (!products.ok) return products
  if (!locations.ok) return locations
  return ok({ products: products.data, locations: locations.data })
}

export async function fetchOfficialAverage(filters: DepartmentFilters): Promise<RepositoryResult<OfficialAverageResult>> {
  const [entries, locations] = await Promise.all([
    dataLayer.repos.prices.listPriceEntries(),
    dataLayer.repos.catalog.listLocations(),
  ])
  if (!entries.ok) return entries
  if (!locations.ok) return locations

  const query: MarketAverageQuery = { ...filters }
  return ok(calculateOfficialMarketAverage(entries.data, locations.data, query))
}

/** Each bucket recalculates from underlying records — never average-of-averages. */
export async function fetchTrend(
  filters: DepartmentFilters,
  granularity: TrendGranularity,
): Promise<RepositoryResult<TrendPoint[]>> {
  const [entries, locations] = await Promise.all([
    dataLayer.repos.prices.listPriceEntries(),
    dataLayer.repos.catalog.listLocations(),
  ])
  if (!entries.ok) return entries
  if (!locations.ok) return locations

  const start = Date.parse(filters.windowStart)
  const end = Date.parse(filters.windowEnd)
  const dayMs = 24 * 60 * 60 * 1000
  const points: TrendPoint[] = []

  let cursor =
    granularity === 'month'
      ? Date.UTC(new Date(start).getUTCFullYear(), new Date(start).getUTCMonth(), 1)
      : start

  while (cursor <= end) {
    const stepEnd =
      granularity === 'day'
        ? Math.min(cursor + dayMs - 1, end)
        : granularity === 'week'
          ? Math.min(cursor + 7 * dayMs - 1, end)
          : Math.min(
              Date.UTC(new Date(cursor).getUTCFullYear(), new Date(cursor).getUTCMonth() + 1, 0, 23, 59, 59, 999),
              end,
            )
    const windowStart = new Date(cursor).toISOString()
    const windowEnd = new Date(stepEnd).toISOString()
    const result = calculateOfficialMarketAverage(entries.data, locations.data, {
      productId: filters.productId,
      locationScopeId: filters.locationScopeId,
      windowStart,
      windowEnd,
      calculatedAt: filters.calculatedAt,
    })
    points.push({ label: `${granularity}:${windowStart.slice(0, 10)}`, result })
    cursor =
      granularity === 'day'
        ? cursor + dayMs
        : granularity === 'week'
          ? cursor + 7 * dayMs
          : Date.UTC(new Date(cursor).getUTCFullYear(), new Date(cursor).getUTCMonth() + 1, 1)
  }

  return ok(points)
}

export async function fetchWeeklyTrend(filters: DepartmentFilters): Promise<RepositoryResult<TrendPoint[]>> {
  return fetchTrend(filters, 'week')
}

export async function fetchRegionalComparison(
  filters: DepartmentFilters,
  parentLocationId: string,
): Promise<RepositoryResult<RegionalRow[]>> {
  const [entries, locations] = await Promise.all([
    dataLayer.repos.prices.listPriceEntries(),
    dataLayer.repos.catalog.listLocations(),
  ])
  if (!entries.ok) return entries
  if (!locations.ok) return locations

  const children = locations.data.filter((loc) => loc.parentId === parentLocationId)
  const rows: RegionalRow[] = children.map((loc) => ({
    locationId: loc.id,
    locationName: loc.nameEn,
    result: calculateOfficialMarketAverage(entries.data, locations.data, {
      ...filters,
      locationScopeId: loc.id,
    }),
  }))

  return ok(rows)
}

export async function fetchActivitySummary(): Promise<RepositoryResult<ActivitySummary>> {
  const [listings, transactions, prices] = await Promise.all([
    dataLayer.repos.marketplace.listListings(),
    dataLayer.repos.marketplace.listTransactions(),
    dataLayer.repos.prices.listPriceEntries(),
  ])
  if (!listings.ok) return listings
  if (!transactions.ok) return transactions
  if (!prices.ok) return prices

  return ok({
    activeListings: listings.data.filter((l) => l.status === 'active').length,
    transactionCount: transactions.data.length,
    approvedPriceEntries: prices.data.filter((p) => p.approvalStatus === 'approved').length,
  })
}

export function buildCsvExport(filters: DepartmentFilters, average: OfficialAverageResult, rows: RegionalRow[]) {
  const header = 'BazarDor price export'
  const meta = [
    `productId,${filters.productId}`,
    `locationScopeId,${filters.locationScopeId}`,
    `windowStart,${filters.windowStart}`,
    `windowEnd,${filters.windowEnd}`,
    `calculatedAt,${filters.calculatedAt}`,
  ]
  const avgLine =
    average.status === 'calculated'
      ? `averagePricePerKg,${average.averagePricePerKg},sampleCount,${average.sampleCount}`
      : `status,insufficient_data,sampleCount,${average.sampleCount}`
  const regional = rows.map(
    (row) =>
      `${row.locationName},${row.result.status},${
        row.result.status === 'calculated' ? row.result.averagePricePerKg : ''
      },${row.result.sampleCount}`,
  )
  return [header, ...meta, avgLine, 'region,status,avg,samples', ...regional].join('\n')
}

export function defaultDepartmentFilters(): DepartmentFilters {
  return {
    productId: 'prod-paddy',
    locationScopeId: D.districtJashore,
    windowStart: '2026-11-01T00:00:00+06:00',
    windowEnd: '2026-11-04T23:59:59+06:00',
    calculatedAt: PRODUCT_CARD_CALCULATED_AT,
  }
}

export function childLocationsUnder(locations: Location[], parentId: string) {
  return locations.filter((loc) => loc.parentId === parentId)
}

export function scopeLabel(locations: Location[], scopeId: string) {
  return locations.find((loc) => loc.id === scopeId)?.nameEn ?? scopeId
}

export function hasMapGeometry(locations: Location[]) {
  return locations.some((loc) => loc.demoCentroid != null)
}

export function regionalMapDots(locations: Location[], rows: RegionalRow[]) {
  const withCentroid = locations.filter((loc) => loc.demoCentroid)
  if (withCentroid.length === 0) return []
  const lats = withCentroid.map((l) => l.demoCentroid!.lat)
  const lngs = withCentroid.map((l) => l.demoCentroid!.lng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  return rows
    .map((row) => {
      const loc = locations.find((l) => l.id === row.locationId)
      if (!loc?.demoCentroid) return null
      const x = ((loc.demoCentroid.lng - minLng) / (maxLng - minLng || 1)) * 100
      const y = ((maxLat - loc.demoCentroid.lat) / (maxLat - minLat || 1)) * 100
      const samples = row.result.sampleCount
      return { id: row.locationId, name: row.locationName, x, y, samples }
    })
    .filter((row): row is NonNullable<typeof row> => row != null)
}

export async function exportWorkbookCsvBlob(filters: DepartmentFilters, average: OfficialAverageResult, regional: RegionalRow[]) {
  const csv = buildCsvExport(filters, average, regional)
  return new Blob([csv], { type: 'text/csv;charset=utf-8' })
}

export async function exportWorkbookXlsxBlob(
  filters: DepartmentFilters,
  average: OfficialAverageResult,
  regional: RegionalRow[],
) {
  const XLSX = await import('xlsx')
  const summary = [
    ['BazarDor price export'],
    ['productId', filters.productId],
    ['locationScopeId', filters.locationScopeId],
    ['windowStart', filters.windowStart],
    ['windowEnd', filters.windowEnd],
    ['calculatedAt', filters.calculatedAt],
    average.status === 'calculated'
      ? ['averagePricePerKg', average.averagePricePerKg, 'sampleCount', average.sampleCount]
      : ['status', 'insufficient_data', 'sampleCount', average.sampleCount],
  ]
  const regionalSheet = [
    ['region', 'status', 'avgPerKg', 'samples'],
    ...regional.map((row) => [
      row.locationName,
      row.result.status,
      row.result.status === 'calculated' ? row.result.averagePricePerKg : '',
      row.result.sampleCount,
    ]),
  ]
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(summary), 'Summary')
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(regionalSheet), 'Regional')
  const buffer = XLSX.write(book, { bookType: 'xlsx', type: 'array' })
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export async function exportPdfBlob(
  filters: DepartmentFilters,
  average: OfficialAverageResult,
  regional: RegionalRow[],
) {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default
  const doc = new jsPDF()
  doc.setFontSize(10)
  doc.text('BazarDor regional price report', 14, 14)
  doc.text(`Product: ${filters.productId}`, 14, 22)
  doc.text(`Scope: ${filters.locationScopeId}`, 14, 28)
  doc.text(`Window: ${filters.windowStart} → ${filters.windowEnd}`, 14, 34)
  if (average.status === 'calculated') {
    doc.text(`Official avg (per kg): ${average.averagePricePerKg.toFixed(2)}`, 14, 42)
    doc.text(`Sample count: ${average.sampleCount}`, 14, 48)
  } else {
    doc.text(`Insufficient Data — samples: ${average.sampleCount}`, 14, 42)
  }

  const tableBody = regional.map((row) => [
    row.locationName,
    row.result.status,
    row.result.status === 'calculated' ? row.result.averagePricePerKg.toFixed(2) : '—',
    String(row.result.sampleCount),
  ])

  autoTable(doc, {
    startY: 56,
    head: [['Region', 'Status', 'Avg/kg', 'Samples']],
    body: tableBody,
  })

  return doc.output('blob')
}
