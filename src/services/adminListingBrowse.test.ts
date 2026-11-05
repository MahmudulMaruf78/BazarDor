import { describe, expect, it } from 'vitest'
import { filterAdminListings } from '@/services/adminListingBrowse'
import type { Listing } from '@/types/domain/records'

const listing: Listing = {
  id: 'listing-1',
  sellerUserId: 'user-seller-1',
  productId: 'prod-paddy',
  locationId: 'bd-upz-khulna-jashore-keshabpur',
  quantity: 100,
  unitId: 'unit-kg',
  availableQuantity: 80,
  reservedQuantity: 20,
  completedQuantity: 0,
  askingPricePerUnit: 50,
  status: 'active',
  createdAt: '2026-01-01T00:00:00+06:00',
}

describe('adminListingBrowse', () => {
  it('filters by status', () => {
    expect(filterAdminListings([listing], { status: 'inactive', search: '' })).toHaveLength(0)
    expect(filterAdminListings([listing], { status: 'active', search: '' })).toHaveLength(1)
  })

  it('filters by search', () => {
    expect(filterAdminListings([listing], { status: 'all', search: 'prod-paddy' })).toHaveLength(1)
  })
})
