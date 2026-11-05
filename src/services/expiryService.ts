import type { PriceEntry } from '@/types/domain/records'
import { DEFAULT_FRESHNESS_HOURS } from './types'

export function computeExpiresAt(approvedAt: string, freshnessHours = DEFAULT_FRESHNESS_HOURS): string {
  const approvedMs = Date.parse(approvedAt)
  return new Date(approvedMs + freshnessHours * 60 * 60 * 1000).toISOString()
}

export function resolveFreshnessStatus(entry: PriceEntry, asOf: string): 'active' | 'expired' {
  if (entry.approvalStatus !== 'approved') {
    return entry.freshnessStatus
  }
  if (entry.expiresAt && Date.parse(entry.expiresAt) <= Date.parse(asOf)) {
    return 'expired'
  }
  return entry.freshnessStatus === 'expired' ? 'expired' : 'active'
}

export function withResolvedFreshness(entry: PriceEntry, asOf: string): PriceEntry {
  return {
    ...entry,
    freshnessStatus: resolveFreshnessStatus(entry, asOf),
  }
}
