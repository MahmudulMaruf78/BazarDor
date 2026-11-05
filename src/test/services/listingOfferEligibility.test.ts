import { describe, expect, it } from 'vitest'
import {
  isProductSellerOfferSelectable,
  resolveBidListingId,
  validateListingEligibleForBid,
} from '@/services/listingOfferEligibility'
import type { ProductSellerOffer } from '@/services/productSellerCompare'
import type { Listing } from '@/types/domain/records'

const baseOffer = (over: Partial<ProductSellerOffer>): ProductSellerOffer => ({
  listingId: 'list-a',
  sellerUserId: 'user-a',
  sellerDisplayName: 'Seller A',
  phonePlaceholder: '01XX-0000-0000',
  locationChainEn: 'Demo',
  locationChainBn: 'ডেমো',
  askingPricePerUnit: 40,
  unitCode: 'kg',
  availableQuantity: 10,
  listingStatus: 'active',
  createdAt: '2026-11-01T00:00:00+06:00',
  ...over,
})

const baseListing = (over: Partial<Listing>): Listing => ({
  id: 'list-a',
  sellerUserId: 'user-a',
  productId: 'prod-potato',
  locationId: 'loc-1',
  quantity: 100,
  unitId: 'unit-kg',
  availableQuantity: 10,
  reservedQuantity: 0,
  completedQuantity: 0,
  askingPricePerUnit: 40,
  status: 'active',
  createdAt: '2026-11-01T00:00:00+06:00',
  ...over,
})

describe('listingOfferEligibility', () => {
  it('marks only active in-stock offers selectable', () => {
    expect(isProductSellerOfferSelectable(baseOffer({}))).toBe(true)
    expect(isProductSellerOfferSelectable(baseOffer({ listingStatus: 'inactive' }))).toBe(false)
    expect(isProductSellerOfferSelectable(baseOffer({ availableQuantity: 0 }))).toBe(false)
    expect(isProductSellerOfferSelectable(baseOffer({ listingStatus: 'sold_out' }))).toBe(false)
  })

  it('requires selected listingId before bid', () => {
    expect(resolveBidListingId(null).ok).toBe(false)
    expect(resolveBidListingId(undefined).ok).toBe(false)
    expect(resolveBidListingId('list-khul-potato-2').ok).toBe(true)
    const resolved = resolveBidListingId('list-khul-potato-2')
    expect(resolved.ok).toBe(true)
    if (resolved.ok) {
      expect(resolved.data).toBe('list-khul-potato-2')
    }
  })

  it('rejects inactive and unavailable listings for bid', () => {
    expect(validateListingEligibleForBid(baseListing({ status: 'inactive' })).ok).toBe(false)
    expect(validateListingEligibleForBid(baseListing({ status: 'sold_out' })).ok).toBe(false)
    expect(validateListingEligibleForBid(baseListing({ availableQuantity: 0 })).ok).toBe(false)
    expect(validateListingEligibleForBid(baseListing({})).ok).toBe(true)
  })

  it('changing selection changes resolved listingId', () => {
    const first = resolveBidListingId('list-ctg-potato')
    const second = resolveBidListingId('list-khul-potato-2')
    expect(first.ok && second.ok).toBe(true)
    if (first.ok && second.ok) {
      expect(first.data).not.toBe(second.data)
    }
  })
})
