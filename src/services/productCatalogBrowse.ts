import type { ListingFilters } from '@/features/marketplace/marketplaceService'
import { expandLocationScope } from '@/services/locationScope'
import {
  PRODUCT_CARD_CALCULATED_AT,
  snapshotForListing,
  type ProductCardMarketSnapshot,
} from '@/services/productCardMarketSnapshot'
import {
  defaultVariantId,
  groupListingsByCatalogKey,
  resolveEffectiveVariantId,
  standardVariantFallback,
} from '@/services/productVariantCatalog'
import type { Listing, Location, PriceEntry, Product, ProductVariant, Unit } from '@/types/domain/records'

export type ProductBrowseCard = {
  product: Product
  variant: ProductVariant
  catalogKey: string
  sellerCount: number
  listingCount: number
  showcaseListing: Listing
  snapshot: ProductCardMarketSnapshot
}

export type ProductBrowsePage = {
  items: ProductBrowseCard[]
  total: number
  page: number
  pageSize: number
}

export type ProductDetailLinkOptions = {
  locationScopeId?: string
  variantId?: string
}

/** Lowest asking active listing; else first eligible row in group. */
export function pickShowcaseListingForGroup(listings: readonly Listing[]): Listing | undefined {
  if (listings.length === 0) return undefined
  const active = listings.filter((l) => l.status === 'active')
  const pool = active.length > 0 ? active : [...listings]
  return pool.reduce((best, row) =>
    row.askingPricePerUnit < best.askingPricePerUnit ? row : best,
  )
}

export function summarizeProductGroup(listings: readonly Listing[]): {
  sellerCount: number
  listingCount: number
} {
  const sellerIds = new Set(listings.map((l) => l.sellerUserId))
  return { sellerCount: sellerIds.size, listingCount: listings.length }
}

/** @deprecated Use groupListingsByCatalogKey — groups by productId + effective variantId. */
export function groupListingsByProductId(listings: readonly Listing[]): Map<string, Listing[]> {
  return groupListingsByCatalogKey(listings)
}

export { groupListingsByCatalogKey }

function variantMatchesSearch(variant: ProductVariant, q: string, qBn: string): boolean {
  const lower = q.toLowerCase()
  return (
    variant.grade?.toLowerCase().includes(lower) === true ||
    variant.quality?.toLowerCase().includes(lower) === true ||
    variant.variety?.toLowerCase().includes(lower) === true ||
    variant.size?.toLowerCase().includes(lower) === true ||
    variant.descriptionEn?.toLowerCase().includes(lower) === true ||
    (variant.descriptionBn?.includes(qBn) ?? false)
  )
}

export function filterListingsForBrowse(
  listings: readonly Listing[],
  filters: ListingFilters,
  products: readonly Product[],
  locations: readonly Location[],
  variants: readonly ProductVariant[] = [],
): Listing[] {
  const productById = new Map(products.map((product) => [product.id, product]))
  const locationById = new Map(locations.map((location) => [location.id, location]))
  const variantById = new Map(variants.map((v) => [v.id, v]))

  let items = listings.filter((listing) => listing.status !== 'inactive')

  if (filters.categoryId) {
    items = items.filter(
      (listing) => productById.get(listing.productId)?.categoryId === filters.categoryId,
    )
  }
  if (filters.locationId) {
    items = items.filter((listing) => listing.locationId === filters.locationId)
  }
  if (filters.locationScopeId) {
    const scope = new Set(expandLocationScope(filters.locationScopeId, locations))
    items = items.filter((listing) => scope.has(listing.locationId))
  }
  if (filters.variantId) {
    items = items.filter(
      (listing) => resolveEffectiveVariantId(listing) === filters.variantId,
    )
  }
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase()
    const qBn = filters.search.trim()
    items = items.filter((listing) => {
      const product = productById.get(listing.productId)
      const location = locationById.get(listing.locationId)
      const variant = variantById.get(resolveEffectiveVariantId(listing))
      return (
        product?.nameEn.toLowerCase().includes(q) ||
        product?.nameBn.includes(qBn) ||
        location?.nameEn.toLowerCase().includes(q) ||
        (variant ? variantMatchesSearch(variant, q, qBn) : false)
      )
    })
  }

  if (filters.sort === 'price-asc') items = [...items].sort((a, b) => a.askingPricePerUnit - b.askingPricePerUnit)
  if (filters.sort === 'price-desc') items = [...items].sort((a, b) => b.askingPricePerUnit - a.askingPricePerUnit)
  if (!filters.sort || filters.sort === 'newest') {
    items = [...items].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  }

  return items
}

function sortProductBrowseCards(
  cards: ProductBrowseCard[],
  sort: ListingFilters['sort'],
): ProductBrowseCard[] {
  const rows = [...cards]
  if (sort === 'price-asc') {
    rows.sort((a, b) => a.snapshot.askingPricePerUnit - b.snapshot.askingPricePerUnit)
  } else if (sort === 'price-desc') {
    rows.sort((a, b) => b.snapshot.askingPricePerUnit - a.snapshot.askingPricePerUnit)
  } else {
    rows.sort(
      (a, b) => Date.parse(b.showcaseListing.createdAt) - Date.parse(a.showcaseListing.createdAt),
    )
  }
  return rows
}

export function buildProductBrowseCards(
  filteredListings: readonly Listing[],
  products: readonly Product[],
  variants: readonly ProductVariant[],
  entries: readonly PriceEntry[],
  locations: readonly Location[],
  units: readonly Unit[],
  locationScopeId?: string,
  calculatedAt: string = PRODUCT_CARD_CALCULATED_AT,
): ProductBrowseCard[] {
  const productById = new Map(products.map((p) => [p.id, p]))
  const variantById = new Map(variants.map((v) => [v.id, v]))
  const groups = groupListingsByCatalogKey(filteredListings)
  const cards: ProductBrowseCard[] = []

  for (const [key, groupListings] of groups) {
    const showcase = pickShowcaseListingForGroup(groupListings)
    if (!showcase) continue
    const product = productById.get(showcase.productId)
    const variantId = resolveEffectiveVariantId(showcase)
    const variant =
      variantById.get(variantId) ??
      (variantId === defaultVariantId(showcase.productId)
        ? standardVariantFallback(showcase.productId)
        : undefined)
    if (!product || !variant) continue
    const { sellerCount, listingCount } = summarizeProductGroup(groupListings)
    cards.push({
      product,
      variant,
      catalogKey: key,
      sellerCount,
      listingCount,
      showcaseListing: showcase,
      snapshot: snapshotForListing(
        showcase,
        entries,
        locations,
        units,
        calculatedAt,
        locationScopeId,
      ),
    })
  }

  return cards
}

export function paginateProductBrowseCards(
  cards: ProductBrowseCard[],
  filters: ListingFilters,
): ProductBrowsePage {
  const sorted = sortProductBrowseCards(cards, filters.sort)
  const pageSize = filters.pageSize ?? 6
  const page = Math.max(1, filters.page ?? 1)
  const start = (page - 1) * pageSize
  return {
    items: sorted.slice(start, start + pageSize),
    total: sorted.length,
    page,
    pageSize,
  }
}

export function productDetailHref(
  productId: string,
  locationScopeIdOrOptions?: string | ProductDetailLinkOptions,
): string {
  const options: ProductDetailLinkOptions =
    typeof locationScopeIdOrOptions === 'string'
      ? { locationScopeId: locationScopeIdOrOptions }
      : (locationScopeIdOrOptions ?? {})
  const params = new URLSearchParams()
  if (options.variantId) params.set('variant', options.variantId)
  if (options.locationScopeId) params.set('scope', options.locationScopeId)
  const q = params.toString()
  return `/product/${productId}${q ? `?${q}` : ''}`
}
