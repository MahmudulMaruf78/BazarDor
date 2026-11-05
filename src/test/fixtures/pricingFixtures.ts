import type { Location, PriceEntry } from '@/types/domain/records'
import { seedLocations } from '@/data/seed'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'

const baseEntry = {
  productId: 'prod-paddy',
  locationId: D.upazilaKeshabpur,
  reportedQuantity: 1,
  reportedUnitId: 'unit-maund',
  reportedTotalPrice: 3200,
  normalizedQuantityKg: 40,
  normalizedPricePerKg: 80,
  consentStatus: 'not_required' as const,
  approvalStatus: 'approved' as const,
  freshnessStatus: 'active' as const,
  isAssisted: false,
  anomalyFlagged: false,
  }

export const fixtureLocations: readonly Location[] = seedLocations

export function makePriceEntry(overrides: Partial<PriceEntry> & Pick<PriceEntry, 'id' | 'farmerId' | 'submittedAt'>): PriceEntry {
  return {
    ...baseEntry,
    submittedByUserId: overrides.farmerId,
    ...overrides,
  }
}

export const windowStart = '2026-11-01T00:00:00+06:00'
export const windowEnd = '2026-11-04T23:59:59+06:00'
export const calculatedAt = '2026-11-04T08:00:00+06:00'
