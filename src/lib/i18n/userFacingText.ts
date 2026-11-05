import type { AppLocale } from '@/lib/formatLocale'
import { type MessageKey, MESSAGES, translate } from '@/lib/i18n/messages'
import type { Notification } from '@/types/domain/records'

const ERROR_MESSAGE_KEYS: Record<string, MessageKey> = {
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
  'Notification not found.': 'errNotFound',
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
  if (!key) return message
  return translate(locale, key)
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

export function statusLabel(locale: AppLocale, prefix: StatusLabelPrefix, status: string): string {
  const key = `${prefix}_${status}` as MessageKey
  if (!(key in MESSAGES.en)) return status
  return translate(locale, key)
}
