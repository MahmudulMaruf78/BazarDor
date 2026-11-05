import type { PriceEntry } from '@/types/domain/records'

export function isConsentEligibleForApproval(entry: PriceEntry): boolean {
  if (!entry.isAssisted) {
    return entry.consentStatus === 'not_required' || entry.consentStatus === 'verified'
  }
  return entry.consentStatus === 'verified'
}

export function isConsentEligibleForAverage(entry: PriceEntry): boolean {
  return isConsentEligibleForApproval(entry)
}

export function consentDisplayLabel(entry: PriceEntry, farmerHasPhone: boolean): string {
  if (!farmerHasPhone && entry.isAssisted) return 'Consent Not Available'
  if (entry.consentStatus === 'pending') return 'Pending Consent'
  if (entry.consentStatus === 'verified') return 'Verified'
  if (entry.consentStatus === 'unavailable') return 'Consent Not Available'
  return 'Not required'
}
