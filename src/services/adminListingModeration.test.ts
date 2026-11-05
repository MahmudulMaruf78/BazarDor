import { describe, expect, it } from 'vitest'
import { resolveListingModerationUpdate } from '@/services/adminListingModeration'
import type { Listing } from '@/types/domain/records'

function baseListing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: 'listing-test',
    sellerUserId: 'user-seller-1',
    productId: 'prod-paddy',
    locationId: 'bd-upz-khulna-jashore-keshabpur',
    quantity: 100,
    unitId: 'unit-kg',
    availableQuantity: 80,
    reservedQuantity: 0,
    completedQuantity: 0,
    askingPricePerUnit: 50,
    status: 'active',
    createdAt: '2026-01-01T00:00:00+06:00',
    ...overrides,
  }
}

describe('resolveListingModerationUpdate', () => {
  it('rejects active listing to inactive', () => {
    const result = resolveListingModerationUpdate(baseListing(), 'reject')
    expect(result.ok && result.data.status).toBe('inactive')
  })

  it('blocks reject when stock is reserved', () => {
    const result = resolveListingModerationUpdate(baseListing({ reservedQuantity: 5 }), 'reject')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.message).toMatch(/reserved/i)
  })

  it('blocks reject on sold_out', () => {
    const result = resolveListingModerationUpdate(
      baseListing({ status: 'sold_out', availableQuantity: 0 }),
      'reject',
    )
    expect(result.ok).toBe(false)
  })

  it('approves inactive to active when stock available', () => {
    const result = resolveListingModerationUpdate(
      baseListing({ status: 'inactive', availableQuantity: 10 }),
      'approve',
    )
    expect(result.ok && result.data.status).toBe('active')
  })

  it('approves inactive to sold_out when no available stock', () => {
    const result = resolveListingModerationUpdate(
      baseListing({ status: 'inactive', availableQuantity: 0, reservedQuantity: 0 }),
      'approve',
    )
    expect(result.ok && result.data.status).toBe('sold_out')
  })

  it('is idempotent when already inactive and rejecting', () => {
    const listing = baseListing({ status: 'inactive' })
    const result = resolveListingModerationUpdate(listing, 'reject')
    expect(result.ok && result.data.status).toBe('inactive')
  })
})
