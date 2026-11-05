import { dataLayer } from '@/data'
import { formatLocationChain } from '@/services/locationHierarchy'
import { expandLocationScope } from '@/services/locationScope'
import {
  PRODUCT_CARD_CALCULATED_AT,
  snapshotForListing,
  type ProductCardMarketSnapshot,
} from '@/services/productCardMarketSnapshot'
import { defaultVariantId, resolveEffectiveVariantId } from '@/services/productVariantCatalog'
import type { Listing, Location, Product, ProductVariant, Unit, User } from '@/types/domain/records'
import { err, ok, type RepositoryResult } from '@/types/result'

export type ProductSellerCompareSort = 'price-asc' | 'price-desc' | 'newest'

export type ProductSellerCompareOptions = {
  locationScopeId?: string
  /** Effective variant id; defaults to standard demo variant for the product. */
  variantId?: string
  sort?: ProductSellerCompareSort
}

export type ProductSellerOffer = {
  listingId: string
  sellerUserId: string
  sellerDisplayName: string
  phonePlaceholder: string
  locationChainEn: string
  locationChainBn: string
  askingPricePerUnit: number
  unitCode: string
  availableQuantity: number
  listingStatus: Listing['status']
  createdAt: string
}

export type ProductSellerCompareResult = {
  product: Product
  variant: ProductVariant
  sellerCount: number
  listingCount: number
  offers: ProductSellerOffer[]
  /** Showcase average for product hero (scope = first offer location or product-wide min scope). */
  heroSnapshot?: ProductCardMarketSnapshot
}

export function countDistinctSellers(offers: readonly ProductSellerOffer[]): number {
  return new Set(offers.map((o) => o.sellerUserId)).size
}

export function buildProductSellerOffers(
  productId: string,
  listings: readonly Listing[],
  users: readonly User[],
  locations: readonly Location[],
  units: readonly Unit[],
  options: ProductSellerCompareOptions = {},
): ProductSellerOffer[] {
  const userById = new Map(users.map((u) => [u.id, u]))
  const variantId = options.variantId ?? defaultVariantId(productId)
  let rows = listings.filter(
    (l) =>
      l.productId === productId &&
      l.status !== 'inactive' &&
      resolveEffectiveVariantId(l) === variantId,
  )

  if (options.locationScopeId) {
    const scope = new Set(expandLocationScope(options.locationScopeId, locations))
    rows = rows.filter((l) => scope.has(l.locationId))
  }

  const offers: ProductSellerOffer[] = []
  for (const listing of rows) {
    const seller = userById.get(listing.sellerUserId)
    const unit = units.find((u) => u.id === listing.unitId)
    offers.push({
      listingId: listing.id,
      sellerUserId: listing.sellerUserId,
      sellerDisplayName: seller?.displayName ?? listing.sellerUserId,
      phonePlaceholder: seller?.phonePlaceholder ?? '01XX-0000-0000',
      locationChainEn: formatLocationChain(listing.locationId, locations, (loc) => loc.nameEn),
      locationChainBn: formatLocationChain(listing.locationId, locations, (loc) => loc.nameBn),
      askingPricePerUnit: listing.askingPricePerUnit,
      unitCode: unit?.code ?? listing.unitId,
      availableQuantity: listing.availableQuantity,
      listingStatus: listing.status,
      createdAt: listing.createdAt,
    })
  }

  const sort = options.sort ?? 'price-asc'
  if (sort === 'price-asc') {
    offers.sort((a, b) => a.askingPricePerUnit - b.askingPricePerUnit)
  } else if (sort === 'price-desc') {
    offers.sort((a, b) => b.askingPricePerUnit - a.askingPricePerUnit)
  } else {
    offers.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  }

  return offers
}

export async function getProductSellerCompare(
  productId: string,
  options: ProductSellerCompareOptions = {},
): Promise<RepositoryResult<ProductSellerCompareResult>> {
  const [listings, products, variants, users, locations, units, priceEntries] = await Promise.all([
    dataLayer.repos.marketplace.listListings(),
    dataLayer.repos.catalog.listProducts(),
    dataLayer.repos.catalog.listProductVariants(),
    dataLayer.repos.users.listUsers(),
    dataLayer.repos.catalog.listLocations(),
    dataLayer.repos.catalog.listUnits(),
    dataLayer.repos.prices.listPriceEntries(),
  ])

  if (!listings.ok) return listings
  if (!products.ok) return products
  if (!variants.ok) return variants
  if (!users.ok) return users
  if (!locations.ok) return locations
  if (!units.ok) return units
  if (!priceEntries.ok) return priceEntries

  const product = products.data.find((p) => p.id === productId)
  if (!product) {
    return err({ code: 'NOT_FOUND', message: 'Product not found.' })
  }

  const effectiveVariantId = options.variantId ?? defaultVariantId(productId)
  const variant = variants.data.find((v) => v.id === effectiveVariantId)
  if (!variant || variant.productId !== productId) {
    return err({ code: 'NOT_FOUND', message: 'Product variant not found.' })
  }

  const compareOptions: ProductSellerCompareOptions = {
    ...options,
    variantId: effectiveVariantId,
  }

  const offers = buildProductSellerOffers(
    productId,
    listings.data,
    users.data,
    locations.data,
    units.data,
    compareOptions,
  )

  const heroListing =
    listings.data.find((l) => l.id === offers[0]?.listingId) ??
    listings.data.find(
      (l) =>
        l.productId === productId &&
        l.status !== 'inactive' &&
        resolveEffectiveVariantId(l) === effectiveVariantId,
    )

  let heroSnapshot: ProductSellerCompareResult['heroSnapshot']
  if (heroListing) {
    heroSnapshot = snapshotForListing(
      heroListing,
      priceEntries.data,
      locations.data,
      units.data,
      PRODUCT_CARD_CALCULATED_AT,
      options.locationScopeId,
    )
  }

  return ok({
    product,
    variant,
    sellerCount: countDistinctSellers(offers),
    listingCount: offers.length,
    offers,
    heroSnapshot,
  })
}
