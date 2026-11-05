import { describe, expect, it } from 'vitest'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'
import { directChildLocations, hasDirectChildren, locationPathFromRoot } from '@/services/locationHierarchy'
import { seedLocations } from '@/data/seed'

describe('locationHierarchy with national seed', () => {
  it('has eight division roots', () => {
    const roots = directChildLocations(undefined, seedLocations)
    expect(roots).toHaveLength(8)
    expect(roots.some((l) => l.id === D.divisionKhulna)).toBe(true)
  })

  it('walks demo union path', () => {
    const path = locationPathFromRoot(D.unionGhona, seedLocations)
    expect(path.map((l) => l.id)).toEqual([
      D.divisionKhulna,
      D.districtJashore,
      D.upazilaKeshabpur,
      D.unionGhona,
    ])
  })

  it('knows demo union is leaf', () => {
    expect(hasDirectChildren(D.upazilaKeshabpur, seedLocations)).toBe(true)
    expect(hasDirectChildren(D.unionGhona, seedLocations)).toBe(false)
  })
})
