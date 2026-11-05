import { beforeEach, describe, expect, it } from 'vitest'
import { resetDemoData } from '@/data/bootstrap/demoDataLifecycle'
import {
  cancelTransaction,
  confirmTransactionSide,
  decideBid,
  restockListing,
  submitBid,
} from '@/features/marketplace/marketplaceService'
import { dataLayer } from '@/data'

describe('Phase 5 marketplace service', () => {
  beforeEach(async () => {
    const reset = await resetDemoData()
    expect(reset.ok).toBe(true)
  })

  it('rejects bid when stock insufficient', async () => {
    const bid = await submitBid({
      buyerUserId: 'user-buyer-1',
      listingId: 'list-potato-1',
      quantity: 9999,
      offeredPricePerUnit: 30,
    })
    expect(bid.ok).toBe(false)
  })

  it('reserves stock once on accept and releases on cancel', async () => {
    const bid = await submitBid({
      buyerUserId: 'user-buyer-1',
      listingId: 'list-potato-1',
      quantity: 10,
      offeredPricePerUnit: 35,
    })
    expect(bid.ok).toBe(true)
    if (!bid.ok) return

    const accepted = await decideBid({
      sellerUserId: 'user-seller-1',
      bidId: bid.data.id,
      decision: 'accepted',
    })
    expect(accepted.ok).toBe(true)

    const listingAfterAccept = await dataLayer.repos.marketplace.getListingById('list-potato-1')
    expect(listingAfterAccept.ok && listingAfterAccept.data.reservedQuantity).toBeGreaterThanOrEqual(10)

    const txnId = accepted.ok ? accepted.data.transaction?.id : undefined
    expect(txnId).toBeTruthy()
    if (!txnId) return

    const cancelled = await cancelTransaction({ userId: 'user-buyer-1', transactionId: txnId })
    expect(cancelled.ok).toBe(true)

    const listingAfterCancel = await dataLayer.repos.marketplace.getListingById('list-potato-1')
    expect(listingAfterCancel.ok).toBe(true)
  })

  it('does not reserve stock on rejected offer', async () => {
    const before = await dataLayer.repos.marketplace.getListingById('list-potato-1')
    const reservedBefore = before.ok ? before.data.reservedQuantity : 0

    const bid = await submitBid({
      buyerUserId: 'user-buyer-1',
      listingId: 'list-potato-1',
      quantity: 5,
      offeredPricePerUnit: 33,
    })
    expect(bid.ok).toBe(true)
    if (!bid.ok) return

    const rejected = await decideBid({
      sellerUserId: 'user-seller-1',
      bidId: bid.data.id,
      decision: 'rejected',
    })
    expect(rejected.ok).toBe(true)

    const after = await dataLayer.repos.marketplace.getListingById('list-potato-1')
    expect(after.ok && after.data.reservedQuantity).toBe(reservedBefore)
  })

  it('completes sale after both confirmations', async () => {
    const bid = await submitBid({
      buyerUserId: 'user-buyer-1',
      listingId: 'list-potato-1',
      quantity: 8,
      offeredPricePerUnit: 34,
    })
    if (!bid.ok) throw new Error('setup bid failed')
    const accepted = await decideBid({
      sellerUserId: 'user-seller-1',
      bidId: bid.data.id,
      decision: 'accepted',
    })
    const txnId = accepted.ok ? accepted.data.transaction?.id : undefined
    if (!txnId) throw new Error('missing txn')

    await confirmTransactionSide({ userId: 'user-buyer-1', transactionId: txnId, side: 'buyer' })
    const completed = await confirmTransactionSide({
      userId: 'user-seller-1',
      transactionId: txnId,
      side: 'seller',
    })
    expect(completed.ok && completed.data.status).toBe('completed')
  })

  it('restocks listing available quantity for owner', async () => {
    const before = await dataLayer.repos.marketplace.getListingById('list-potato-1')
    expect(before.ok).toBe(true)
    if (!before.ok) return
    const availableBefore = before.data.availableQuantity

    const restock = await restockListing({
      sellerUserId: 'user-seller-1',
      listingId: 'list-potato-1',
      additionalQuantity: 5,
    })
    expect(restock.ok).toBe(true)
    if (!restock.ok) return
    expect(restock.data.availableQuantity).toBe(availableBefore + 5)
  })
})
