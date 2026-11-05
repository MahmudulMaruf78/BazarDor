import { beforeEach, describe, expect, it } from 'vitest'
import { resetDemoData } from '@/data/bootstrap/demoDataLifecycle'
import { submitBid } from '@/features/marketplace/marketplaceService'
import { POTATO_PREMIUM_VARIANT_ID } from '@/data/seed/marketplaceDemo'
import { resolveBidListingId } from '@/services/listingOfferEligibility'
import { getProductSellerCompare } from '@/services/productSellerCompare'

describe('product seller offer selection for bids', () => {
  beforeEach(async () => {
    const reset = await resetDemoData()
    expect(reset.ok).toBe(true)
  })

  it('lists multiple seller offers on product detail data', async () => {
    const compare = await getProductSellerCompare('prod-potato', {
      variantId: POTATO_PREMIUM_VARIANT_ID,
    })
    expect(compare.ok).toBe(true)
    if (!compare.ok) return
    expect(compare.data.offers.length).toBeGreaterThanOrEqual(2)
    expect(compare.data.sellerCount).toBeGreaterThanOrEqual(2)
  })

  it('submitBid uses exact listingId, not another seller', async () => {
    const compare = await getProductSellerCompare('prod-potato', {
      variantId: POTATO_PREMIUM_VARIANT_ID,
    })
    expect(compare.ok).toBe(true)
    if (!compare.ok) return
    const target = compare.data.offers.find((o) => o.listingId === 'list-khul-potato-2')
    const other = compare.data.offers.find((o) => o.listingId === 'list-ctg-potato')
    expect(target && other).toBeTruthy()
    if (!target || !other) return

    const resolved = resolveBidListingId(target.listingId)
    expect(resolved.ok).toBe(true)
    if (!resolved.ok) return

    const bid = await submitBid({
      buyerUserId: 'user-buyer-1',
      listingId: resolved.data,
      quantity: 5,
      offeredPricePerUnit: target.askingPricePerUnit,
    })
    expect(bid.ok).toBe(true)
    if (!bid.ok) return
    expect(bid.data.listingId).toBe('list-khul-potato-2')
    expect(bid.data.listingId).not.toBe(other.listingId)
  })

  it('rejects bid on unavailable listing after eligibility check', async () => {
    const bid = await submitBid({
      buyerUserId: 'user-buyer-1',
      listingId: 'list-onion-sold',
      quantity: 1,
      offeredPricePerUnit: 70,
    })
    expect(bid.ok).toBe(false)
  })
})
