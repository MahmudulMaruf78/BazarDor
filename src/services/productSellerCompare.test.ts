import { describe, expect, it } from 'vitest'
import { buildProductSellerOffers, countDistinctSellers } from '@/services/productSellerCompare'
import { defaultVariantId } from '@/services/productVariantCatalog'
import { POTATO_PREMIUM_VARIANT_ID } from '@/data/seed/marketplaceDemo'
import type { Listing, Location, Unit, User } from '@/types/domain/records'

const unit: Unit = {
  id: 'unit-kg',
  code: 'kg',
  nameEn: 'Kilogram',
  nameBn: 'কেজি',
  kgPerUnit: 1,
}

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
  parentId: 'loc-dist',
  dataSource: 'jumman04',
}

const locDist: Location = {
  id: 'loc-dist',
  nameEn: 'District',
  nameBn: 'District',
  type: 'district',
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

const locations = [locA, locB, locUpz, locDist, locDiv]

const seller1: User = {
  id: 'u1',
  role: 'farmer',
  displayName: 'Seller One',
  phonePlaceholder: '01XX-1111-1111',
  createdAt: '2026-01-01T00:00:00+06:00',
}

const seller2: User = {
  id: 'u2',
  role: 'seller',
  displayName: 'Seller Two',
  phonePlaceholder: '01XX-2222-2222',
  createdAt: '2026-01-01T00:00:00+06:00',
}

function listing(id: string, sellerId: string, locationId: string, price: number, status: Listing['status']): Listing {
  return {
    id,
    sellerUserId: sellerId,
    productId: 'prod-tomato',
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

describe('buildProductSellerOffers', () => {
  it('sorts by price ascending by default', () => {
    const offers = buildProductSellerOffers(
      'prod-tomato',
      [listing('l1', 'u1', 'loc-a', 50, 'active'), listing('l2', 'u2', 'loc-b', 40, 'active')],
      [seller1, seller2],
      locations,
      [unit],
    )
    expect(offers).toHaveLength(2)
    expect(offers[0]!.askingPricePerUnit).toBe(40)
    expect(offers[1]!.askingPricePerUnit).toBe(50)
  })

  it('excludes inactive listings', () => {
    const offers = buildProductSellerOffers(
      'prod-tomato',
      [listing('l1', 'u1', 'loc-a', 50, 'inactive'), listing('l2', 'u2', 'loc-b', 40, 'active')],
      [seller1, seller2],
      locations,
      [unit],
    )
    expect(offers).toHaveLength(1)
    expect(offers[0]!.listingId).toBe('l2')
  })

  it('filters by location scope', () => {
    const offers = buildProductSellerOffers(
      'prod-tomato',
      [listing('l1', 'u1', 'loc-a', 50, 'active'), listing('l2', 'u2', 'loc-b', 40, 'active')],
      [seller1, seller2],
      locations,
      [unit],
      { locationScopeId: 'loc-a' },
    )
    expect(offers).toHaveLength(1)
    expect(offers[0]!.locationChainEn).toContain('Union A')
  })

  it('includes phone placeholder and seller name', () => {
    const offers = buildProductSellerOffers(
      'prod-tomato',
      [listing('l1', 'u1', 'loc-a', 50, 'active')],
      [seller1],
      locations,
      [unit],
    )
    expect(offers[0]!.sellerDisplayName).toBe('Seller One')
    expect(offers[0]!.phonePlaceholder).toMatch(/^01XX-/)
    expect(offers[0]!.listingStatus).toBe('active')
  })

  it('counts distinct sellers vs listing rows', () => {
    const offers = buildProductSellerOffers(
      'prod-tomato',
      [
        listing('l1', 'u1', 'loc-a', 50, 'active'),
        listing('l2', 'u1', 'loc-b', 48, 'active'),
        listing('l3', 'u2', 'loc-b', 40, 'active'),
      ],
      [seller1, seller2],
      locations,
      [unit],
    )
    expect(offers).toHaveLength(3)
    expect(countDistinctSellers(offers)).toBe(2)
  })

  it('returns offers only for selected variant', () => {
    const listings = [
      { ...listing('l1', 'u1', 'loc-a', 50, 'active'), productId: 'prod-potato' },
      {
        ...listing('l2', 'u2', 'loc-b', 40, 'active'),
        productId: 'prod-potato',
        variantId: POTATO_PREMIUM_VARIANT_ID,
      },
    ]
    const standard = buildProductSellerOffers(
      'prod-potato',
      listings,
      [seller1, seller2],
      locations,
      [unit],
      { variantId: defaultVariantId('prod-potato') },
    )
    const premium = buildProductSellerOffers(
      'prod-potato',
      listings,
      [seller1, seller2],
      locations,
      [unit],
      { variantId: POTATO_PREMIUM_VARIANT_ID },
    )
    expect(standard).toHaveLength(1)
    expect(premium).toHaveLength(1)
    expect(standard[0]!.listingId).toBe('l1')
    expect(premium[0]!.listingId).toBe('l2')
  })
})

describe('getProductSellerCompare', () => {
  it('returns NOT_FOUND for missing product', async () => {
    const { getProductSellerCompare } = await import('@/services/productSellerCompare')
    const { resetDemoData } = await import('@/data/bootstrap/demoDataLifecycle')
    expect((await resetDemoData()).ok).toBe(true)
    const result = await getProductSellerCompare('prod-does-not-exist')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe('NOT_FOUND')
  })
})
