import type { AppLocale } from '@/lib/formatLocale'
import { formatDemoNumber } from '@/lib/formatLocale'
import { type MessageKey, MESSAGES, translate } from '@/lib/i18n/messages'
import type { Notification } from '@/types/domain/records'

export const ERROR_MESSAGE_KEYS: Record<string, MessageKey> = {
  'Insufficient available stock.': 'errInsufficientStock',
  'Stock would become negative.': 'errStockNegative',
  'Field officer cannot approve an entry they submitted.': 'errSelfApproval',
  'Consent Not Available for this farmer.': 'errConsentUnavailable',
  'Only the listing seller can decide offers.': 'errSellerOnlyDecide',
  'Bid is already decided.': 'errBidDecided',
  'Completed transaction cannot cancel.': 'errTxnCompletedCancel',
  'Only transaction parties can cancel.': 'errTxnCancelParty',
  'Buyer confirmation only.': 'errBuyerConfirmOnly',
  'Seller confirmation only.': 'errSellerConfirmOnly',
  'Transaction is already closed.': 'errTxnClosed',
  'Entry not found.': 'errEntryNotFound',
  'Farmer profile not found.': 'errFarmerNotFound',
  'Queue item not found.': 'errQueueNotFound',
  'Notification not found.': 'errNotificationNotFound',
  'Not found.': 'errNotFound',
  'Quantity must be positive.': 'errQuantityPositive',
  'Total price must be positive.': 'errTotalPricePositive',
  'Unit is not allowed for this product.': 'errUnitNotAllowed',
  'Invalid unit conversion.': 'errInvalidUnitConversion',
  'Additional quantity must be positive.': 'errAdditionalQtyPositive',
  'Only the listing owner can restock.': 'errListingOwnerRestock',
  'Quantity and asking price must be positive.': 'errQtyAskingPositive',
  'Bid not found.': 'errBidNotFound',
  'Transaction not found.': 'errTxnNotFound',
  'Product or unit not found.': 'errProductUnitNotFound',
  'Product not found.': 'errProductNotFound',
  'Product variant not found.': 'errProductVariantNotFound',
  'Select an offer before bidding.': 'errSelectOfferBeforeBid',
  'Listing is not available for offers.': 'errListingNotAvailableForOffer',
  'Selected offer is no longer available.': 'errSelectedOfferUnavailable',
  'Cannot release more than reserved stock.': 'errCannotReleaseReserved',
  'Transaction is not eligible for stock completion.': 'errTxnNotEligibleStock',
  'Both buyer and seller confirmation required.': 'errBothConfirmRequired',
  'Invalid completion quantity.': 'errInvalidCompletionQty',
  'Only pending entries can be approved.': 'errOnlyPendingApprove',
  'Consent must be verified before approval.': 'errConsentBeforeApproval',
  'Only pending entries can be rejected.': 'errOnlyPendingReject',
  'Rejection requires a reason.': 'errRejectionReasonRequired',
  'Location is outside the officer assigned area.': 'errLocationOutsideArea',
  'Display name (EN/BN) is required.': 'errDisplayNameRequired',
  'Profile id is required.': 'errProfileIdRequired',
  'QR must use profile id — not a phone number.': 'errQrNotPhone',
  'No farmer profile matches this id.': 'errNoFarmerForProfileId',
  'Sold-out listings cannot be rejected via moderation.': 'errListingModerationSoldOut',
  'Cannot reject listing while stock is reserved for an accepted offer.': 'errListingModerationReserved',
  'Only active listings can be rejected.': 'errListingModerationActiveOnly',
  'Only inactive listings can be approved.': 'errListingModerationInactiveApprove',
  'Actor user id is required.': 'errActorRequired',
  'Listing not found.': 'errListingNotFound',
  'Failed to initialize demo data.': 'errInitDemoData',
  'Failed to write demo seed to IndexedDB.': 'errWriteDemoSeed',
  'Could not read storage schema version.': 'errReadSchemaVersion',
  'Could not save demo session data.': 'errSaveSession',
  'Could not clear demo session.': 'errClearSession',
  'Invalid sync queue item.': 'errInvalidSyncQueueItem',
  'Could not save sync queue item.': 'errSaveSyncQueueItem',
  'Invalid store for list operation.': 'errInvalidStoreList',
  'Could not load listing.': 'errCouldNotLoadListing',
  locationValidationDivisionRequired: 'locationValidationDivisionRequired',
  locationValidationInvalidDivision: 'locationValidationInvalidDivision',
  locationValidationInvalidDistrict: 'locationValidationInvalidDistrict',
  locationValidationDistrictParent: 'locationValidationDistrictParent',
  locationValidationInvalidUpazila: 'locationValidationInvalidUpazila',
  locationValidationUpazilaParent: 'locationValidationUpazilaParent',
  locationValidationInvalidUnion: 'locationValidationInvalidUnion',
  locationValidationUnionParent: 'locationValidationUnionParent',
}

export function translateUserError(message: string, locale: AppLocale): string {
  const key = ERROR_MESSAGE_KEYS[message]
  if (key) return translate(locale, key)
  if (message in MESSAGES.en) return translate(locale, message as MessageKey)
  return message
}

const NOTIF_KEY_IDS = ['notif-1', 'notif-2', 'notif-3'] as const

function notifKey(id: string, part: 'title' | 'body'): MessageKey | null {
  if (!NOTIF_KEY_IDS.includes(id as (typeof NOTIF_KEY_IDS)[number])) return null
  const key = `notif_${id.replace(/-/g, '_')}_${part}` as MessageKey
  return key in MESSAGES.en ? key : null
}

export function notificationDisplayText(
  notification: Notification,
  locale: AppLocale,
): { title: string; body: string } {
  const titleKey = notifKey(notification.id, 'title')
  const bodyKey = notifKey(notification.id, 'body')
  return {
    title: titleKey ? translate(locale, titleKey) : notification.title,
    body: bodyKey ? translate(locale, bodyKey) : notification.body,
  }
}

export type StatusLabelPrefix =
  | 'bidStatus'
  | 'txnStatus'
  | 'approvalStatus'
  | 'consentStatus'
  | 'listingStatus'
  | 'freshnessStatus'
  | 'syncStatus'

export function statusLabel(locale: AppLocale, prefix: StatusLabelPrefix, status: string): string {
  const key = `${prefix}_${status}` as MessageKey
  if (!(key in MESSAGES.en)) return status
  return translate(locale, key)
}

const AUDIT_ACTION_KEYS: Record<string, MessageKey> = {
  assisted_entry_created: 'auditAction_assisted_entry_created',
  consent_verified_demo: 'auditAction_consent_verified_demo',
  approved: 'auditAction_approved',
  rejected: 'auditAction_rejected',
  assisted_farmer_registered: 'auditAction_assisted_farmer_registered',
}

export function auditActionLabel(locale: AppLocale, action: string): string {
  const key = AUDIT_ACTION_KEYS[action]
  if (!key) return action
  return translate(locale, key)
}

export function formatHeatmapDotTitle(
  locale: AppLocale,
  name: string,
  count: number,
): string {
  return translate(locale, 'heatmapDotTitle')
    .replace('{name}', name)
    .replace('{count}', formatDemoNumber(count, locale, 0))
}
