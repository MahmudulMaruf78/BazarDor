import { dataLayer } from '@/data'
import type { ListingStatus } from '@/types/domain/enums'
import type { Listing } from '@/types/domain/records'
import { err, ok, type RepositoryResult } from '@/types/result'

export type ListingModerationDecision = 'approve' | 'reject'

export type ModerateListingInput = {
  listingId: string
  decision: ListingModerationDecision
  actorUserId: string
}

function targetStatusForApprove(listing: Listing): ListingStatus {
  return listing.availableQuantity > 0 ? 'active' : 'sold_out'
}

export function resolveListingModerationUpdate(
  listing: Listing,
  decision: ListingModerationDecision,
): RepositoryResult<Listing> {
  if (decision === 'reject') {
    if (listing.status === 'inactive') {
      return ok(listing)
    }
    if (listing.status === 'sold_out') {
      return err({ code: 'VALIDATION', message: 'Sold-out listings cannot be rejected via moderation.' })
    }
    if (listing.reservedQuantity > 0) {
      return err({
        code: 'VALIDATION',
        message: 'Cannot reject listing while stock is reserved for an accepted offer.',
      })
    }
    if (listing.status !== 'active') {
      return err({ code: 'VALIDATION', message: 'Only active listings can be rejected.' })
    }
    return ok({ ...listing, status: 'inactive' })
  }

  if (listing.status === 'active' || listing.status === 'sold_out') {
    return ok(listing)
  }
  if (listing.status !== 'inactive') {
    return err({ code: 'VALIDATION', message: 'Only inactive listings can be approved.' })
  }
  return ok({ ...listing, status: targetStatusForApprove(listing) })
}

export async function moderateListing(input: ModerateListingInput): Promise<RepositoryResult<Listing>> {
  if (!input.actorUserId.trim()) {
    return err({ code: 'VALIDATION', message: 'Actor user id is required.' })
  }

  const listings = await dataLayer.repos.marketplace.listListings()
  if (!listings.ok) return listings

  const listing = listings.data.find((l) => l.id === input.listingId)
  if (!listing) {
    return err({ code: 'NOT_FOUND', message: 'Listing not found.' })
  }

  const resolved = resolveListingModerationUpdate(listing, input.decision)
  if (!resolved.ok) return resolved

  if (resolved.data.status === listing.status) {
    return ok(listing)
  }

  return dataLayer.repos.marketplace.saveListing(resolved.data)
}
