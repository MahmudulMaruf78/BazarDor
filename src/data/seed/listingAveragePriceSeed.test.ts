import { describe, expect, it } from 'vitest'
import { demoSeedBundle } from '@/data/seed'
import { demoMarketLocations } from '@/data/seed/marketplaceDemo'
import { calculateOfficialMarketAverage } from '@/services/officialMarketPriceService'
import {
  buildExploreLeafSnapshots,
  PRODUCT_CARD_AVERAGE_WINDOW,
  PRODUCT_CARD_CALCULATED_AT,
} from '@/services/productCardMarketSnapshot'

describe('listing average supplemental seed', () => {
  it('every active listing scope has a calculated official average', () => {
    const { listings, priceEntries, locations } = demoSeedBundle
    for (const listing of listings) {
      if (listing.status !== 'active') continue
      const result = calculateOfficialMarketAverage(priceEntries, locations, {
        productId: listing.productId,
        locationScopeId: listing.locationId,
        ...PRODUCT_CARD_AVERAGE_WINDOW,
        calculatedAt: PRODUCT_CARD_CALCULATED_AT,
      })
      expect(result.status, `${listing.id} ${listing.productId} @ ${listing.locationId}`).toBe('calculated')
      if (result.status === 'calculated') {
        expect(result.sampleCount).toBeGreaterThanOrEqual(2)
      }
    }
  })

  it('Explore Gazipur leaf rows show calculated averages when listings exist', () => {
    const rows = buildExploreLeafSnapshots(
      demoMarketLocations.gazipur,
      demoSeedBundle.products,
      demoSeedBundle.productVariants,
      demoSeedBundle.listings,
      demoSeedBundle.priceEntries,
      demoSeedBundle.locations,
      demoSeedBundle.units,
    )
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) {
      expect(row.snapshot.officialAverage.status).toBe('calculated')
    }
  })
})
