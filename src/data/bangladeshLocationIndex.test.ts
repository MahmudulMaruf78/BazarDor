import { describe, expect, it } from 'vitest'
import {
  bangladeshLocationCounts,
  countBangladeshLocationsByType,
  formatBangladeshLocationLabel,
  getBangladeshLocationById,
  getBangladeshLocationParentId,
  getBangladeshPathIds,
  listBangladeshDivisions,
} from '@/data/bangladeshLocationIndex'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'

describe('bangladeshLocationIndex', () => {
  it('has eight divisions', () => {
    expect(listBangladeshDivisions()).toHaveLength(8)
    expect(bangladeshLocationCounts.divisions).toBe(8)
    expect(countBangladeshLocationsByType().district).toBe(64)
  })

  it('appends Demo suffix only for demo_synthetic unions', () => {
    const synthetic = getBangladeshLocationById('bd-uni-barishal-bhola-daulatkhan-sample-1')
    expect(synthetic?.dataSource).toBe('demo_synthetic')
    expect(formatBangladeshLocationLabel(synthetic!, 'en', '(Demo sample)')).toContain('(Demo sample)')

    const corridor = getBangladeshLocationById(D.unionGhona)
    expect(formatBangladeshLocationLabel(corridor!, 'en', '(Demo sample)')).not.toContain('(Demo sample)')
  })

  it('links Jashore district to Khulna division', () => {
    expect(getBangladeshLocationParentId(D.districtJashore)).toBe(D.divisionKhulna)
    const district = getBangladeshLocationById(D.districtJashore)
    expect(district?.type).toBe('district')
  })

  it('links demo unions to upazilas', () => {
    expect(getBangladeshLocationParentId(D.unionGhona)).toBe(D.upazilaKeshabpur)
    expect(getBangladeshLocationParentId(D.unionDurgapur)).toBe(D.upazilaMonirampur)
  })

  it('builds path from union leaf', () => {
    const path = getBangladeshPathIds(D.unionDurgapur)
    expect(path[0]).toBe(D.divisionKhulna)
    expect(path).toContain(D.districtJashore)
    expect(path[path.length - 1]).toBe(D.unionDurgapur)
  })
})
