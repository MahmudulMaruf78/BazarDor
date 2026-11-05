import type { ListingStatus } from '@/types/domain/enums'
import type { Listing } from '@/types/domain/records'

export type AdminListingStatusFilter = ListingStatus | 'all'

export type AdminListingBrowseCriteria = {
  status: AdminListingStatusFilter
  search: string
}

export function filterAdminListings(
  listings: readonly Listing[],
  criteria: AdminListingBrowseCriteria,
): Listing[] {
  const q = criteria.search.trim().toLowerCase()
  return listings.filter((l) => {
    if (criteria.status !== 'all' && l.status !== criteria.status) return false
    if (!q) return true
    return (
      l.id.toLowerCase().includes(q) ||
      l.sellerUserId.toLowerCase().includes(q) ||
      l.productId.toLowerCase().includes(q) ||
      l.locationId.toLowerCase().includes(q)
    )
  })
}
