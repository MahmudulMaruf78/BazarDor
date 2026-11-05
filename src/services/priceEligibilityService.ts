import type { Location, PriceEntry } from '@/types/domain/records'
import { isConsentEligibleForAverage } from './consentService'
import { isLocationInScope } from './locationScope'
import { resolveFreshnessStatus } from './expiryService'
import type { MarketAverageQuery } from './types'

export function isWithinTimeWindow(submittedAt: string, windowStart: string, windowEnd: string): boolean {
  const at = Date.parse(submittedAt)
  return at >= Date.parse(windowStart) && at <= Date.parse(windowEnd)
}

export function isEligibleForOfficialAverage(
  entry: PriceEntry,
  query: MarketAverageQuery,
  locations: readonly Location[],
  asOf: string,
): boolean {
  if (entry.productId !== query.productId) return false
  if (!isLocationInScope(entry.locationId, query.locationScopeId, locations)) return false
  if (!isWithinTimeWindow(entry.submittedAt, query.windowStart, query.windowEnd)) return false
  if (entry.approvalStatus !== 'approved') return false
  if (!isConsentEligibleForAverage(entry)) return false
  if (resolveFreshnessStatus(entry, asOf) !== 'active') return false
  return true
}

export function filterEligibleForOfficialAverage(
  entries: readonly PriceEntry[],
  query: MarketAverageQuery,
  locations: readonly Location[],
  asOf: string,
): PriceEntry[] {
  return entries.filter((entry) => isEligibleForOfficialAverage(entry, query, locations, asOf))
}
