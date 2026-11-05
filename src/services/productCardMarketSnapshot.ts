import { calculateOfficialMarketAverage } from '@/services/officialMarketPriceService'
import { formatLocationChain } from '@/services/locationHierarchy'
import { expandLocationScope } from '@/services/locationScope'
import type { OfficialAverageResult } from '@/services/types'
import type { Listing, Location, PriceEntry, Product, Unit } from '@/types/domain/records'

/** ponytail: fixed seed-aligned window; change if default analytics window moves */
export const PRODUCT_CARD_AVERAGE_WINDOW = {
  windowStart: '2026-11-01T00:00:00+06:00',
  windowEnd: '2026-11-04T23:59:59+06:00',
} as const

/** ponytail: before seed expiresAt; matches pricing test fixtures — not wall clock */
export const PRODUCT_CARD_CALCULATED_AT = '2026-11-04T08:00:00+06:00'

export type ProductCardMarketSnapshot = {
  locationChainEn: string
  locationChainBn: string
  askingPricePerUnit: number
  unitCode: string
  officialAverage: OfficialAverageResult
}

function pickShowcaseListing(productId: string, listings: readonly Listing[]): Listing | undefined {
  const forProduct = listings.filter((l) => l.productId === productId)
  return forProduct.find((l) => l.status === 'active') ?? forProduct[0]
}

function snapshotForListing(
  listing: Listing,
  entries: readonly PriceEntry[],
  locations: readonly Location[],
  units: readonly Unit[],
  calculatedAt: string,
  scopeLocationId?: string,
): ProductCardMarketSnapshot {
  const unit = units.find((u) => u.id === listing.unitId)
  const query = {
    productId: listing.productId,
    locationScopeId: scopeLocationId ?? listing.locationId,
    ...PRODUCT_CARD_AVERAGE_WINDOW,
    calculatedAt,
  }
  return {
    locationChainEn: formatLocationChain(listing.locationId, locations, (loc) => loc.nameEn),
    locationChainBn: formatLocationChain(listing.locationId, locations, (loc) => loc.nameBn),
    askingPricePerUnit: listing.askingPricePerUnit,
    unitCode: unit?.code ?? listing.unitId,
    officialAverage: calculateOfficialMarketAverage(entries, locations, query),
  }
}

function pickActiveListingInScope(
  productId: string,
  scopeIds: readonly string[],
  listings: readonly Listing[],
): Listing | undefined {
  const inScope = listings.filter(
    (l) => l.productId === productId && scopeIds.includes(l.locationId) && l.status === 'active',
  )
  return inScope[0]
}

export type ExploreLeafProductRow = {
  product: Product
  snapshot: ProductCardMarketSnapshot
}

export function buildExploreLeafSnapshots(
  scopeLocationId: string,
  products: readonly Product[],
  listings: readonly Listing[],
  entries: readonly PriceEntry[],
  locations: readonly Location[],
  units: readonly Unit[],
  calculatedAt: string = PRODUCT_CARD_CALCULATED_AT,
): ExploreLeafProductRow[] {
  const scopeIds = expandLocationScope(scopeLocationId, locations)
  const rows: ExploreLeafProductRow[] = []
  for (const product of products) {
    const listing = pickActiveListingInScope(product.id, scopeIds, listings)
    if (!listing) continue
    rows.push({
      product,
      snapshot: snapshotForListing(listing, entries, locations, units, calculatedAt, scopeLocationId),
    })
  }
  return rows
}

export function buildHomeProductSnapshots(
  products: readonly Product[],
  listings: readonly Listing[],
  entries: readonly PriceEntry[],
  locations: readonly Location[],
  units: readonly Unit[],
  calculatedAt: string = PRODUCT_CARD_CALCULATED_AT,
): Map<string, ProductCardMarketSnapshot> {
  const map = new Map<string, ProductCardMarketSnapshot>()
  for (const product of products) {
    const listing = pickShowcaseListing(product.id, listings)
    if (!listing) continue
    map.set(product.id, snapshotForListing(listing, entries, locations, units, calculatedAt))
  }
  return map
}

export function snapshotsForListings(
  listings: readonly Listing[],
  entries: readonly PriceEntry[],
  locations: readonly Location[],
  units: readonly Unit[],
  calculatedAt: string = PRODUCT_CARD_CALCULATED_AT,
): Map<string, ProductCardMarketSnapshot> {
  const map = new Map<string, ProductCardMarketSnapshot>()
  for (const listing of listings) {
    map.set(listing.id, snapshotForListing(listing, entries, locations, units, calculatedAt))
  }
  return map
}
