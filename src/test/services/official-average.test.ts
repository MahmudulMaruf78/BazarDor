import { describe, expect, it } from 'vitest'
import { calculateOfficialMarketAverage } from '@/services/officialMarketPriceService'
import { selectLatestEligiblePerFarmer } from '@/services/latestEntrySelector'
import { expandLocationScope } from '@/services/locationScope'
import { resolveFreshnessStatus } from '@/services/expiryService'
import {
  calculatedAt,
  fixtureLocations,
  makePriceEntry,
  windowEnd,
  windowStart,
} from '@/test/fixtures/pricingFixtures'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'

describe('latestEntrySelector', () => {
  it('keeps only latest eligible entry per farmer', () => {
    const entries = [
      makePriceEntry({ id: 'a-old', farmerId: 'user-farmer-1', submittedAt: '2026-11-01T06:00:00+06:00' }),
      makePriceEntry({
        id: 'a-new',
        farmerId: 'user-farmer-1',
        submittedAt: '2026-11-04T07:30:00+06:00',
        normalizedPricePerKg: 82,
      }),
    ]
    const latest = selectLatestEligiblePerFarmer(entries)
    expect(latest).toHaveLength(1)
    expect(latest[0]?.id).toBe('a-new')
  })
})

describe('locationScope', () => {
  it('pools descendant locations under parent scope', () => {
    const scope = expandLocationScope(D.districtJashore, fixtureLocations)
    expect(scope).toContain(D.districtJashore)
    expect(scope).toContain(D.upazilaKeshabpur)
    expect(scope).not.toContain(D.divisionKhulna)
  })
})

describe('officialMarketPriceService', () => {
  const query = {
    productId: 'prod-paddy',
    locationScopeId: D.districtJashore,
    windowStart,
    windowEnd,
    calculatedAt,
  }

  it('returns insufficient data for one farmer', () => {
    const entries = [
      makePriceEntry({ id: 'only-one', farmerId: 'user-farmer-1', submittedAt: '2026-11-04T07:30:00+06:00' }),
    ]
    const result = calculateOfficialMarketAverage(entries, fixtureLocations, query)
    expect(result.status).toBe('insufficient_data')
  })

  it('averages two farmers and uses latest entry per farmer', () => {
    const entries = [
      makePriceEntry({ id: 'f1-old', farmerId: 'user-farmer-1', submittedAt: '2026-11-01T06:00:00+06:00', normalizedPricePerKg: 70 }),
      makePriceEntry({ id: 'f1-new', farmerId: 'user-farmer-1', submittedAt: '2026-11-04T07:30:00+06:00', normalizedPricePerKg: 82 }),
      makePriceEntry({ id: 'f2', farmerId: 'user-farmer-2', submittedAt: '2026-11-03T08:00:00+06:00', normalizedPricePerKg: 79 }),
    ]
    const result = calculateOfficialMarketAverage(entries, fixtureLocations, query)
    expect(result.status).toBe('calculated')
    if (result.status === 'calculated') {
      expect(result.sampleCount).toBe(2)
      expect(result.averagePricePerKg).toBeCloseTo(80.5, 5)
      expect(result.demoLabel).toBe('Demo / Sample')
    }
  })

  it('excludes pending consent and expired entries', () => {
    const entries = [
      makePriceEntry({ id: 'ok-1', farmerId: 'user-farmer-1', submittedAt: '2026-11-04T07:30:00+06:00', normalizedPricePerKg: 80 }),
      makePriceEntry({ id: 'ok-2', farmerId: 'user-farmer-2', submittedAt: '2026-11-03T08:00:00+06:00', normalizedPricePerKg: 78 }),
      makePriceEntry({
        id: 'pending',
        farmerId: 'user-farmer-3',
        submittedByUserId: 'user-fo-1',
        submittedAt: '2026-11-04T07:30:00+06:00',
        approvalStatus: 'pending',
        isAssisted: true,
        consentStatus: 'pending',
      }),
      makePriceEntry({
        id: 'expired',
        farmerId: 'user-farmer-4',
        submittedAt: '2026-10-28T06:00:00+06:00',
        expiresAt: '2026-10-29T06:30:00+06:00',
      }),
    ]
    const result = calculateOfficialMarketAverage(entries, fixtureLocations, query)
    expect(result.status).toBe('calculated')
    if (result.status === 'calculated') {
      expect(result.sampleCount).toBe(2)
    }
  })
})

describe('expiryService', () => {
  it('marks approved entries expired after expiresAt', () => {
    const entry = makePriceEntry({
      id: 'exp',
      farmerId: 'user-farmer-1',
      submittedAt: '2026-10-28T06:00:00+06:00',
      expiresAt: '2026-10-29T06:30:00+06:00',
    })
    expect(resolveFreshnessStatus(entry, '2026-11-04T08:00:00+06:00')).toBe('expired')
  })
})
