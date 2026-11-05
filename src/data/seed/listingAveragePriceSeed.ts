import { filterEligibleForOfficialAverage } from '@/services/priceEligibilityService'
import { selectLatestEligiblePerFarmer } from '@/services/latestEntrySelector'
import {
  PRODUCT_CARD_AVERAGE_WINDOW,
  PRODUCT_CARD_CALCULATED_AT,
} from '@/services/productCardMarketSnapshot'
import type { Listing, Location, PriceEntry } from '@/types/domain/records'

const T1 = '2026-11-03T08:00:00+06:00'
const T2 = '2026-11-04T07:30:00+06:00'
const EXPIRES = '2026-11-05T09:00:00+06:00'

const DEMO_FARMERS = [
  'user-farmer-1',
  'user-farmer-2',
  'user-farmer-3',
  'user-farmer-4',
  'user-farmer-5',
  'user-farmer-6',
] as const

function slugPart(raw: string, max = 48): string {
  return raw.replace(/^prod-/, '').replace(/^bd-/, '').replace(/[^a-z0-9-]/gi, '-').slice(0, max)
}

function makePriceEntry(
  id: string,
  farmerId: string,
  productId: string,
  locationId: string,
  kgPrice: number,
  submittedAt: string,
): PriceEntry {
  return {
    id,
    farmerId,
    submittedByUserId: farmerId,
    productId,
    locationId,
    reportedQuantity: 1,
    reportedUnitId: 'unit-maund',
    reportedTotalPrice: kgPrice * 40,
    normalizedQuantityKg: 40,
    normalizedPricePerKg: kgPrice,
    consentStatus: 'not_required',
    approvalStatus: 'approved',
    freshnessStatus: 'active',
    isAssisted: false,
    anomalyFlagged: false,
    submittedAt,
    approvedAt: submittedAt,
    expiresAt: EXPIRES,
  }
}

function eligibleFarmerIds(
  entries: readonly PriceEntry[],
  productId: string,
  locationScopeId: string,
  locations: readonly Location[],
): Set<string> {
  const query = {
    productId,
    locationScopeId,
    ...PRODUCT_CARD_AVERAGE_WINDOW,
    calculatedAt: PRODUCT_CARD_CALCULATED_AT,
  }
  const eligible = filterEligibleForOfficialAverage(
    entries,
    query,
    locations,
    PRODUCT_CARD_CALCULATED_AT,
  )
  return new Set(selectLatestEligiblePerFarmer(eligible).map((e) => e.farmerId))
}

/** Fills gaps so each active listing scope has ≥2 farmers for product-card averages. */
export function buildSupplementalAveragePriceEntries(
  listings: readonly Listing[],
  existingEntries: readonly PriceEntry[],
  locations: readonly Location[],
): PriceEntry[] {
  const supplemental: PriceEntry[] = []
  const combined = (): readonly PriceEntry[] => [...existingEntries, ...supplemental]
  const seenScope = new Set<string>()

  for (const listing of listings) {
    if (listing.status !== 'active') continue
    const scopeKey = `${listing.productId}|${listing.locationId}`
    if (seenScope.has(scopeKey)) continue
    seenScope.add(scopeKey)

    let farmers = eligibleFarmerIds(combined(), listing.productId, listing.locationId, locations)
    if (farmers.size >= 2) continue

    const base = listing.askingPricePerUnit
    const prodSlug = slugPart(listing.productId)
    const locSlug = slugPart(listing.locationId)
    let suffix = 0

    for (const farmerId of DEMO_FARMERS) {
      if (farmers.size >= 2) break
      if (farmers.has(farmerId)) continue
      const letter = suffix === 0 ? 'a' : 'b'
      const id = `pe-avg-${prodSlug}-${locSlug}-${letter}`.replace(/--+/g, '-')
      const offset = suffix === 0 ? -1 : 1
      const submittedAt = suffix % 2 === 0 ? T1 : T2
      supplemental.push(
        makePriceEntry(
          id,
          farmerId,
          listing.productId,
          listing.locationId,
          Math.max(1, base + offset),
          submittedAt,
        ),
      )
      farmers.add(farmerId)
      suffix += 1
    }
  }

  return supplemental
}
