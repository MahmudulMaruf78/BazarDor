import { describe, expect, it } from 'vitest'
import raw from '@/data/bangladesh-locations.json'
import { demoSeedBundle, seedProducts } from '@/data/seed'
import { getBangladeshChildren } from '@/data/bangladeshLocationIndex'

type JsonRoot = { unionImportStats?: { upazilasTotal: number; upazilasWithAtLeast1Union: number; upazilasWithAtLeast3Unions: number } }
const stats = (raw as JsonRoot).unionImportStats

describe('union import coverage', () => {
  it('every upazila has at least three unions after BD-JSON + synthetic gaps', () => {
    expect(stats?.upazilasTotal).toBe(493)
    expect(stats?.upazilasWithAtLeast1Union).toBe(493)
    expect(stats?.upazilasWithAtLeast3Unions).toBe(493)
  })

  it('Singra upazila has imported union children (not only sample placeholders)', () => {
    const unions = getBangladeshChildren('bd-upz-rajshahi-natore-singra')
    expect(unions.length).toBeGreaterThanOrEqual(3)
    expect(unions.every((u) => u.type === 'union')).toBe(true)
    expect(unions.some((u) => !u.id.endsWith('-sample-1'))).toBe(true)
  })

  it('BD-JSON–unmatched upazila gets synthetic sample unions', () => {
    const upzId = 'bd-upz-barishal-barisal-uzirpur'
    const unions = getBangladeshChildren(upzId)
    expect(unions.length).toBeGreaterThanOrEqual(3)
    expect(unions.some((u) => u.id === 'bd-uni-barishal-barisal-uzirpur-sample-1')).toBe(true)
    expect(unions[0]?.nameEn).toMatch(/\(Demo\)/)
  })
})

describe('marketplace demo seed', () => {
  it('exposes at least 16 products and 5 categories', () => {
    expect(seedProducts.length).toBeGreaterThanOrEqual(16)
    expect(demoSeedBundle.categories.length).toBeGreaterThanOrEqual(5)
  })

  it('every seed product uses a demo PNG asset (not placeholder)', () => {
    for (const p of seedProducts) {
      expect(p.imageUrl).toMatch(/\/demo-products\/[\w-]+\.png$/)
      expect(p.imageUrl).not.toContain('placeholder')
    }
  })

  it('includes cross-division demo listings', () => {
    expect(demoSeedBundle.listings.length).toBeGreaterThanOrEqual(36)
    const locationIds = new Set(demoSeedBundle.listings.map((l) => l.locationId))
    expect(locationIds.size).toBeGreaterThanOrEqual(8)
  })

  it('each category has at least one product and one active listing', () => {
    for (const cat of demoSeedBundle.categories) {
      const productIds = new Set(seedProducts.filter((p) => p.categoryId === cat.id).map((p) => p.id))
      expect(productIds.size, cat.id).toBeGreaterThanOrEqual(1)
      const active = demoSeedBundle.listings.filter(
        (l) => l.status === 'active' && productIds.has(l.productId),
      )
      expect(active.length, cat.id).toBeGreaterThanOrEqual(1)
    }
  })
})
