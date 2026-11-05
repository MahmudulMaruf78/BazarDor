import { calculateOfficialMarketAverage } from '@/services/officialMarketPriceService'
import { formatLocationChain } from '@/services/locationHierarchy'
import { expandLocationScope } from '@/services/locationScope'
import { buildProductBrowseCards, pickShowcaseListingForGroup } from '@/services/productCatalogBrowse'
import type { OfficialAverageResult } from '@/services/types'
import type { Listing, Location, PriceEntry, Product, ProductVariant, Unit } from '@/types/domain/records'

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
  const forProduct = listings.filter((l) => l.productId === productId && l.status !== 'inactive')
  return pickShowcaseListingForGroup(forProduct)
}

export function snapshotForListing(
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

export type ExploreLeafProductRow = {
  product: Product
  variant: ProductVariant
  catalogKey: string
  snapshot: ProductCardMarketSnapshot
  sellerCount: number
  listingCount: number
}

export function buildExploreLeafSnapshots(
  scopeLocationId: string,
  products: readonly Product[],
  variants: readonly ProductVariant[],
  listings: readonly Listing[],
  entries: readonly PriceEntry[],
  locations: readonly Location[],
  units: readonly Unit[],
  calculatedAt: string = PRODUCT_CARD_CALCULATED_AT,
): ExploreLeafProductRow[] {
  const scopeIds = new Set(expandLocationScope(scopeLocationId, locations))
  const inScope = listings.filter(
    (l) => scopeIds.has(l.locationId) && l.status !== 'inactive',
  )
  const cards = buildProductBrowseCards(
    inScope,
    products,
    variants,
    entries,
    locations,
    units,
    scopeLocationId,
    calculatedAt,
  )
  return cards.map((card) => ({
    product: card.product,
    variant: card.variant,
    catalogKey: card.catalogKey,
    snapshot: card.snapshot,
    sellerCount: card.sellerCount,
    listingCount: card.listingCount,
  }))
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
