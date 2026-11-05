import { describe, expect, it } from 'vitest'
import importStats from '../../documentations/BANGLADESH_UNION_IMPORT_STATS.json'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'
import {
  countBangladeshLocationsByType,
  getBangladeshChildren,
  getBangladeshLocationById,
  getBangladeshLocationParentId,
  listAllBangladeshLocationNodes,
} from '@/data/bangladeshLocationIndex'

const EXPECTED_PARENT_TYPE: Record<string, string | undefined> = {
  division: undefined,
  district: 'division',
  upazila: 'district',
  union: 'upazila',
}

describe('bangladesh location hierarchy (Phase 9)', () => {
  it('has 8 divisions, 64 districts, 493 upazilas', () => {
    const counts = countBangladeshLocationsByType()
    expect(counts.division).toBe(8)
    expect(counts.district).toBe(64)
    expect(counts.upazila).toBe(493)
    expect(counts.union).toBeGreaterThan(0)
  })

  it('every node has a valid parent chain', () => {
    for (const node of listAllBangladeshLocationNodes()) {
      const parentId = getBangladeshLocationParentId(node.id)
      const expectedParentType = EXPECTED_PARENT_TYPE[node.type]
      if (expectedParentType == null) {
        expect(parentId).toBeUndefined()
        continue
      }
      expect(parentId, node.id).toBeDefined()
      const parent = getBangladeshLocationById(parentId!)
      expect(parent?.type, node.id).toBe(expectedParentType)
    }
  })

  it('demo_synthetic unions use -sample- id suffix only', () => {
    for (const node of listAllBangladeshLocationNodes()) {
      if (node.dataSource !== 'demo_synthetic') continue
      expect(node.type).toBe('union')
      expect(node.id, node.id).toMatch(/-sample-\d+$/)
    }
  })

  it('bd_json unions are under upazilas', () => {
    for (const node of listAllBangladeshLocationNodes()) {
      if (node.dataSource !== 'bd_json') continue
      expect(node.type).toBe('union')
      const parent = getBangladeshLocationById(getBangladeshLocationParentId(node.id)!)
      expect(parent?.type).toBe('upazila')
    }
  })

  it('demo corridor unions are the curated Khulna/Jashore pair', () => {
    for (const node of listAllBangladeshLocationNodes()) {
      if (node.dataSource !== 'demo_corridor') continue
      expect([D.unionGhona, D.unionDurgapur]).toContain(node.id)
    }
  })

  it('Slice D alias pass lowered unmatched vs Slice C', () => {
    expect(importStats.upazilasUnmatched).toBeLessThan(importStats.phase9SliceCUnmatched)
  })

  it('Slice E alias pass lowered unmatched vs Slice D', () => {
    expect(importStats.phase9SliceDUnmatched).toBe(94)
    expect(importStats.upazilasUnmatched).toBeLessThan(importStats.phase9SliceDUnmatched)
  })

  it('Noakhali Hatiya imports bd_json unions after Slice E', () => {
    const unions = getBangladeshChildren('bd-upz-chattogram-noakhali-hatiya')
    expect(unions.some((u) => u.dataSource === 'bd_json')).toBe(true)
    expect(unions.some((u) => u.id.endsWith('-sample-1'))).toBe(false)
  })

  it('Slice C alias pass lowered unmatched vs Slice B', () => {
    expect(importStats.upazilasUnmatched).toBeLessThanOrEqual(importStats.phase9SliceBUnmatched)
    expect(importStats.upazilasUnmatched).toBeLessThan(importStats.phase9SliceBUnmatched)
  })

  it('matched upazila can import more than five bd_json unions (Slice B full import)', () => {
    const singra = listAllBangladeshLocationNodes().filter(
      (n) => n.type === 'union' && getBangladeshLocationParentId(n.id) === 'bd-upz-rajshahi-natore-singra',
    )
    const bdJson = singra.filter((n) => n.dataSource === 'bd_json')
    expect(bdJson.length).toBeGreaterThan(5)
  })
})
