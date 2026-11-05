import type { Location, PriceEntry } from '@/types/domain/records'
import { filterEligibleForOfficialAverage } from './priceEligibilityService'
import { selectLatestEligiblePerFarmer } from './latestEntrySelector'
import type { MarketAverageQuery, OfficialAverageResult } from './types'

export function calculateOfficialMarketAverage(
  entries: readonly PriceEntry[],
  locations: readonly Location[],
  query: MarketAverageQuery,
): OfficialAverageResult {
  const eligible = filterEligibleForOfficialAverage(entries, query, locations, query.calculatedAt)
  const latestPerFarmer = selectLatestEligiblePerFarmer(eligible)
  const distinctFarmerCount = latestPerFarmer.length

  if (distinctFarmerCount < 2) {
    return {
      status: 'insufficient_data',
      sampleCount: latestPerFarmer.length,
      distinctFarmerCount,
      productId: query.productId,
      locationScopeId: query.locationScopeId,
      windowStart: query.windowStart,
      windowEnd: query.windowEnd,
      calculatedAt: query.calculatedAt,
    }
  }

  const sum = latestPerFarmer.reduce((total, entry) => total + entry.normalizedPricePerKg, 0)

  return {
    status: 'calculated',
    averagePricePerKg: sum / latestPerFarmer.length,
    sampleCount: latestPerFarmer.length,
    productId: query.productId,
    locationScopeId: query.locationScopeId,
    windowStart: query.windowStart,
    windowEnd: query.windowEnd,
    calculatedAt: query.calculatedAt,
  }
}
