import { describe, expect, it } from 'vitest'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'
import { demoSeedBundle } from '@/data/seed'
import { seedListings, seedLocations, seedPriceEntries, seedProducts, seedUnits } from '@/data/seed'
import { buildExploreLeafSnapshots, snapshotsForListings } from '@/services/productCardMarketSnapshot'

describe('productCardMarketSnapshot', () => {
  it('calculates official average for onion at union scope with frozen asOf', () => {
    const listing = seedListings.find((l) => l.id === 'list-onion-active')
    expect(listing).toBeDefined()

    const snap = snapshotsForListings(
      [listing!],
      seedPriceEntries,
      seedLocations,
      seedUnits,
    ).get(listing!.id)

    expect(snap?.officialAverage.status).toBe('calculated')
    if (snap?.officialAverage.status === 'calculated') {
      expect(snap.officialAverage.averagePricePerKg).toBeCloseTo(67.5, 5)
      expect(snap.officialAverage.sampleCount).toBe(2)
    }
  })

  it('buildExploreLeafSnapshots at union includes onion with calculated average', () => {
    const rows = buildExploreLeafSnapshots(
      D.unionDurgapur,
      seedProducts,
      demoSeedBundle.productVariants,
      seedListings,
      seedPriceEntries,
      seedLocations,
      seedUnits,
    )
    const onion = rows.find((r) => r.product.id === 'prod-onion')
    expect(onion?.snapshot.officialAverage.status).toBe('calculated')
  })
})
