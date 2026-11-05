import { describe, expect, it } from 'vitest'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'
import { validateDemoSeedBundle } from '@/data/bootstrap/demoDataLifecycle'
import { locationSchema, priceEntrySchema } from '@/schemas/domain'

describe('Phase 2 domain schemas', () => {
  it('accepts bundled demo seed', () => {
    expect(validateDemoSeedBundle().ok).toBe(true)
  })

  it('accepts location metadata fields (Phase 9)', () => {
    const parsed = locationSchema.safeParse({
      id: D.unionGhona,
      parentId: D.upazilaKeshabpur,
      nameEn: 'Ghona Union',
      nameBn: 'ঘোনা ইউনিয়ন',
      type: 'union',
      dataSource: 'demo_corridor',
      demoCentroid: { lat: 23.1, lng: 89.2 },
    })
    expect(parsed.success).toBe(true)
  })

  it('rejects invalid price entry records', () => {
    const parsed = priceEntrySchema.safeParse({
      id: 'bad',
      farmerId: 'user-farmer-1',
      submittedByUserId: 'user-farmer-1',
      productId: 'prod-paddy',
      locationId: D.upazilaKeshabpur,
      reportedQuantity: -1,
      reportedUnitId: 'unit-kg',
      reportedTotalPrice: 100,
      normalizedQuantityKg: 10,
      normalizedPricePerKg: 10,
      consentStatus: 'not_required',
      approvalStatus: 'approved',
      freshnessStatus: 'active',
      isAssisted: false,
      anomalyFlagged: false,
      submittedAt: '2026-11-04T07:30:00+06:00',
      demoLabel: 'Demo',
    })
    expect(parsed.success).toBe(false)
  })
})
