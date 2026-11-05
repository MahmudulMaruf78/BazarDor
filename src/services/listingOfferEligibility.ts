import type { ProductSellerOffer } from '@/services/productSellerCompare'
import type { Listing } from '@/types/domain/records'
import { serviceErr, serviceOk, type ServiceResult } from '@/services/types'

/** Active listing with stock — selectable on product detail. */
export function isProductSellerOfferSelectable(offer: ProductSellerOffer): boolean {
  return offer.listingStatus === 'active' && offer.availableQuantity > 0
}

export function validateListingEligibleForBid(listing: Listing): ServiceResult<void> {
  if (listing.status === 'inactive') {
    return serviceErr({ code: 'VALIDATION', message: 'Listing is not available for offers.' })
  }
  if (listing.status !== 'active' || listing.availableQuantity <= 0) {
    return serviceErr({ code: 'VALIDATION', message: 'Selected offer is no longer available.' })
  }
  return serviceOk(undefined)
}

/** ponytail: guard before submitBid — never fall back to showcase listingId. */
export function resolveBidListingId(selectedListingId: string | null | undefined): ServiceResult<string> {
  if (!selectedListingId) {
    return serviceErr({ code: 'VALIDATION', message: 'Select an offer before bidding.' })
  }
  return serviceOk(selectedListingId)
}
