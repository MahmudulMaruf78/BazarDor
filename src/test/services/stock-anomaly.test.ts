import { describe, expect, it } from 'vitest'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'
import { shouldFlagAnomaly } from '@/services/anomalyService'
import {
  completeListingSale,
  isTransactionCompleted,
  releaseListingReservation,
  reserveListingStock,
  validateAvailableStock,
} from '@/services/stockService'
import type { Listing, Transaction } from '@/types/domain/records'

const listing: Listing = {
  id: 'list-1',
  sellerUserId: 'user-seller-1',
  productId: 'prod-potato',
  locationId: D.districtJashore,
  quantity: 100,
  unitId: 'unit-kg',
  availableQuantity: 50,
  reservedQuantity: 10,
  completedQuantity: 0,
  askingPricePerUnit: 40,
  status: 'active',
  demoLabel: 'Demo',
  createdAt: '2026-11-01T06:00:00+06:00',
}

describe('anomalyService', () => {
  it('does not flag when threshold not configured', () => {
    expect(shouldFlagAnomaly(200, 80, {})).toBe(false)
  })

  it('flags large deviation when threshold configured', () => {
    expect(shouldFlagAnomaly(120, 80, { maxDeviationPercent: 20 })).toBe(true)
  })
})

describe('stockService', () => {
  it('blocks bid above available stock', () => {
    expect(validateAvailableStock(listing, 51).ok).toBe(false)
  })

  it('reserves stock once on acceptance', () => {
    const reserved = reserveListingStock(listing, 20)
    expect(reserved.ok && reserved.data.availableQuantity).toBe(30)
    expect(reserved.ok && reserved.data.reservedQuantity).toBe(30)
  })

  it('releases reservation on cancellation path', () => {
    const afterReserve = reserveListingStock(listing, 20)
    if (!afterReserve.ok) throw new Error('setup failed')
    const released = releaseListingReservation(afterReserve.data, 20)
    expect(released.ok && released.data.availableQuantity).toBe(50)
    expect(released.ok && released.data.reservedQuantity).toBe(10)
  })

  it('completes sale only with both confirmations', () => {
    const afterReserve = reserveListingStock(listing, 15)
    if (!afterReserve.ok) throw new Error('setup failed')

    const txn: Transaction = {
      id: 'txn-test',
      bidId: 'bid-test',
      listingId: listing.id,
      buyerUserId: 'user-buyer-1',
      sellerUserId: listing.sellerUserId,
      quantity: 15,
      unitId: 'unit-kg',
      pricePerUnit: 38,
      status: 'completed',
      buyerConfirmedAt: '2026-11-04T08:00:00+06:00',
      sellerConfirmedAt: '2026-11-04T08:05:00+06:00',
      createdAt: '2026-11-04T08:00:00+06:00',
      demoLabel: 'Demo',
    }

    expect(isTransactionCompleted(txn)).toBe(true)
    const completed = completeListingSale(afterReserve.data, 15, txn)
    expect(completed.ok && completed.data.reservedQuantity).toBe(afterReserve.data.reservedQuantity - 15)
    expect(completed.ok && completed.data.completedQuantity).toBe(15)
  })
})
