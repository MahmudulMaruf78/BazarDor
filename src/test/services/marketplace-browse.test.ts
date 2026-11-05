import { describe, expect, it } from 'vitest'
import { resetDemoData } from '@/data/bootstrap/demoDataLifecycle'
import { demoMarketLocations } from '@/data/seed/marketplaceDemo'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'
import { browseListings } from '@/features/marketplace/marketplaceService'

describe('browseListings filters', () => {
  it('combines search and location scope', async () => {
    expect((await resetDemoData()).ok).toBe(true)
    const scoped = await browseListings({
      search: 'Tomato',
      locationScopeId: 'bd-div-dhaka',
      pageSize: 50,
    })
    expect(scoped.ok).toBe(true)
    if (!scoped.ok) return
    expect(scoped.data.items.length).toBeGreaterThan(0)
    for (const row of scoped.data.items) {
      expect(row.productId).toBe('prod-tomato')
    }
  })

  it('filters by category and union leaf scope', async () => {
    expect((await resetDemoData()).ok).toBe(true)
    const scoped = await browseListings({
      categoryId: 'cat-vegetables',
      locationScopeId: demoMarketLocations.gazipur,
      pageSize: 50,
    })
    expect(scoped.ok).toBe(true)
    if (!scoped.ok) return
    expect(scoped.data.items.length).toBeGreaterThan(0)
    for (const row of scoped.data.items) {
      expect(row.locationId).toBe(demoMarketLocations.gazipur)
    }
  })

  it('division scope excludes listings from other divisions', async () => {
    expect((await resetDemoData()).ok).toBe(true)
    const khulna = await browseListings({
      locationScopeId: D.divisionKhulna,
      pageSize: 100,
    })
    const dhaka = await browseListings({
      locationScopeId: 'bd-div-dhaka',
      pageSize: 100,
    })
    expect(khulna.ok && dhaka.ok).toBe(true)
    if (!khulna.ok || !dhaka.ok) return
    const khulnaIds = new Set(khulna.data.items.map((l) => l.id))
    for (const row of dhaka.data.items) {
      expect(khulnaIds.has(row.id)).toBe(false)
    }
  })
})
