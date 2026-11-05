import type { PriceEntry } from '@/types/domain/records'

/** Latest eligible entry per farmer within one calculation group. */
export function selectLatestEligiblePerFarmer(entries: readonly PriceEntry[]): PriceEntry[] {
  const latestByFarmer = new Map<string, PriceEntry>()

  for (const entry of entries) {
    const existing = latestByFarmer.get(entry.farmerId)
    if (!existing || Date.parse(entry.submittedAt) > Date.parse(existing.submittedAt)) {
      latestByFarmer.set(entry.farmerId, entry)
    }
  }

  return [...latestByFarmer.values()]
}
