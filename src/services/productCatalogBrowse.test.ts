import { describe, expect, it } from 'vitest'
import {
  buildProductBrowseCards,
  filterListingsForBrowse,
  groupListingsByCatalogKey,
  paginateProductBrowseCards,
  pickShowcaseListingForGroup,
  summarizeProductGroup,
} from '@/services/productCatalogBrowse'
import { defaultVariantId } from '@/services/productVariantCatalog'
import { POTATO_PREMIUM_VARIANT_ID } from '@/data/seed/marketplaceDemo'
import type { Listing, Location, Product, ProductVariant, Unit } from '@/types/domain/records'

const unit: Unit = {
  id: 'unit-kg',
  code: 'kg',
  nameEn: 'Kilogram',
  nameBn: 'কেজি',
  kgPerUnit: 1,
}

const potato: Product = {
  id: 'prod-potato',
  categoryId: 'cat-vegetables',
  nameEn: 'Potato',
  nameBn: 'আলু',
  allowedUnitIds: ['unit-kg'],
  imageUrl: '/demo-products/prod-potato.jpg',
}

const tomato: Product = {
  id: 'prod-tomato',
  categoryId: 'cat-vegetables',
  nameEn: 'Tomato',
  nameBn: 'টমেটো',
  allowedUnitIds: ['unit-kg'],
  imageUrl: '/demo-products/prod-tomato.jpg',
}

function variantFor(product: Product, extra?: Partial<ProductVariant>): ProductVariant {
  return {
    id: defaultVariantId(product.id),
    productId: product.id,
    quality: 'Standard (demo sample)',
    ...extra,
  }
}

const potatoStandard = variantFor(potato)
const potatoPremium: ProductVariant = {
  id: POTATO_PREMIUM_VARIANT_ID,
  productId: 'prod-potato',
  grade: 'Grade A (demo sample)',
}
const tomatoStandard = variantFor(tomato)
const variants = [potatoStandard, potatoPremium, tomatoStandard]

const locA: Location = {
  id: 'loc-a',
  nameEn: 'Union A',
  nameBn: 'Union A',
  type: 'union',
  parentId: 'loc-upz',
  dataSource: 'jumman04',
}

const locB: Location = {
  id: 'loc-b',
  nameEn: 'Union B',
  nameBn: 'Union B',
  type: 'union',
  parentId: 'loc-upz',
  dataSource: 'jumman04',
}

const locUpz: Location = {
  id: 'loc-upz',
  nameEn: 'Upazila',
  nameBn: 'Upazila',
  type: 'upazila',
  parentId: 'loc-div',
  dataSource: 'jumman04',
}

const locDiv: Location = {
  id: 'loc-div',
  nameEn: 'Division',
  nameBn: 'Division',
  type: 'division',
  dataSource: 'jumman04',
}

const locations = [locA, locB, locUpz, locDiv]

function listing(
  id: string,
  productId: string,
  sellerId: string,
  locationId: string,
  price: number,
  status: Listing['status'] = 'active',
  variantId?: string,
): Listing {
  return {
    id,
    sellerUserId: sellerId,
    productId,
    ...(variantId ? { variantId } : {}),
    locationId,
    quantity: 100,
    unitId: 'unit-kg',
    availableQuantity: 50,
    reservedQuantity: 0,
    completedQuantity: 0,
    askingPricePerUnit: price,
    status,
    createdAt: '2026-01-01T00:00:00+06:00',
  }
}

describe('productCatalogBrowse', () => {
  it('groups three sellers on one product variant into one card with sellerCount 3', () => {
    const listings = [
      listing('l1', 'prod-potato', 's1', 'loc-a', 40),
      listing('l2', 'prod-potato', 's2', 'loc-a', 45),
      listing('l3', 'prod-potato', 's3', 'loc-b', 50),
    ]
    const groups = groupListingsByCatalogKey(listings)
    expect(groups.size).toBe(1)
    const summary = summarizeProductGroup(groups.get('prod-potato::var-prod-potato-standard')!)
    expect(summary.sellerCount).toBe(3)
    expect(summary.listingCount).toBe(3)
  })

  it('same product with different variants yields separate browse cards', () => {
    const listings = [
      listing('l1', 'prod-potato', 's1', 'loc-a', 40),
      listing('l2', 'prod-potato', 's2', 'loc-a', 45, 'active', POTATO_PREMIUM_VARIANT_ID),
    ]
    const cards = buildProductBrowseCards(listings, [potato], variants, [], locations, [unit])
    expect(cards).toHaveLength(2)
    expect(new Set(cards.map((c) => c.catalogKey)).size).toBe(2)
  })

  it('multiple sellers on same variant stay one card', () => {
    const listings = [
      listing('l1', 'prod-potato', 's1', 'loc-a', 40, 'active', POTATO_PREMIUM_VARIANT_ID),
      listing('l2', 'prod-potato', 's2', 'loc-b', 39, 'active', POTATO_PREMIUM_VARIANT_ID),
    ]
    const cards = buildProductBrowseCards(listings, [potato], variants, [], locations, [unit])
    expect(cards).toHaveLength(1)
    expect(cards[0]!.sellerCount).toBe(2)
    expect(cards[0]!.listingCount).toBe(2)
  })

  it('legacy listings without variantId use standard bucket', () => {
    const listings = [listing('l1', 'prod-potato', 's1', 'loc-a', 40)]
    const cards = buildProductBrowseCards(listings, [potato], variants, [], locations, [unit])
    expect(cards[0]!.variant.id).toBe(defaultVariantId('prod-potato'))
  })

  it('one seller with two listings counts one seller and two listing rows', () => {
    const listings = [
      listing('l1', 'prod-potato', 's1', 'loc-a', 40),
      listing('l2', 'prod-potato', 's1', 'loc-b', 42),
    ]
    const summary = summarizeProductGroup(listings)
    expect(summary.sellerCount).toBe(1)
    expect(summary.listingCount).toBe(2)
  })

  it('never merges different product ids', () => {
    const listings = [
      listing('l1', 'prod-potato', 's1', 'loc-a', 40),
      listing('l2', 'prod-tomato', 's2', 'loc-a', 30),
    ]
    expect(groupListingsByCatalogKey(listings).size).toBe(2)
  })

  it('excludes inactive listings from browse filter', () => {
    const filtered = filterListingsForBrowse(
      [listing('l1', 'prod-potato', 's1', 'loc-a', 40, 'inactive'), listing('l2', 'prod-potato', 's2', 'loc-a', 35)],
      {},
      [potato, tomato],
      locations,
      variants,
    )
    expect(filtered).toHaveLength(1)
    expect(filtered[0]!.id).toBe('l2')
  })

  it('location scope reduces grouped listings', () => {
    const listings = [
      listing('l1', 'prod-potato', 's1', 'loc-a', 40),
      listing('l2', 'prod-potato', 's2', 'loc-b', 35),
    ]
    const filtered = filterListingsForBrowse(
      listings,
      { locationScopeId: 'loc-a' },
      [potato],
      locations,
      variants,
    )
    expect(filtered).toHaveLength(1)
  })

  it('pickShowcaseListingForGroup uses lowest active asking price', () => {
    const pick = pickShowcaseListingForGroup([
      listing('l1', 'prod-potato', 's1', 'loc-a', 50),
      listing('l2', 'prod-potato', 's2', 'loc-a', 35),
    ])
    expect(pick?.id).toBe('l2')
  })

  it('paginateProductCatalog counts variant cards not raw listings', () => {
    const listings = [
      listing('l1', 'prod-potato', 's1', 'loc-a', 40),
      listing('l2', 'prod-potato', 's2', 'loc-a', 45, 'active', POTATO_PREMIUM_VARIANT_ID),
      listing('l3', 'prod-tomato', 's3', 'loc-a', 30),
    ]
    const cards = buildProductBrowseCards(listings, [potato, tomato], variants, [], locations, [unit])
    const page = paginateProductBrowseCards(cards, { page: 1, pageSize: 10 })
    expect(page.total).toBe(3)
    expect(page.items).toHaveLength(3)
  })

  it('builds standard cards when variant store rows missing', () => {
    const listings = [listing('l1', 'prod-potato', 's1', 'loc-a', 40)]
    const cards = buildProductBrowseCards(listings, [potato], [], [], locations, [unit])
    expect(cards).toHaveLength(1)
    expect(cards[0]!.variant.id).toBe(defaultVariantId('prod-potato'))
  })
})
