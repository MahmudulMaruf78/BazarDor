import { describe, expect, it } from 'vitest'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'
import {
  countByDataSource,
  filterAdminLocations,
  LOCATION_DATA_SOURCES,
  paginateAdminLocations,
  adminLocationPageCount,
} from '@/services/adminLocationBrowse'
import type { Location } from '@/types/domain/records'

const sample: Location[] = [
  {
    id: D.divisionKhulna,
    nameEn: 'Khulna Division',
    nameBn: 'খুলনা',
    type: 'division',
    dataSource: 'jumman04',
  },
  {
    id: D.unionGhona,
    parentId: D.upazilaKeshabpur,
    nameEn: 'Ghona Union',
    nameBn: 'ঘোনা',
    type: 'union',
    dataSource: 'demo_corridor',
  },
  {
    id: 'bd-uni-barishal-barisal-uzirpur-sample-1',
    parentId: 'bd-upz-barishal-barisal-uzirpur',
    nameEn: 'Sample Union 1 (Demo)',
    nameBn: 'নমুনা',
    type: 'union',
    dataSource: 'demo_synthetic',
  },
  {
    id: 'bd-uni-rajshahi-natore-singra-a',
    parentId: 'bd-upz-rajshahi-natore-singra',
    nameEn: 'Example Union',
    nameBn: 'উদাহরণ',
    type: 'union',
    dataSource: 'bd_json',
  },
]

describe('adminLocationBrowse', () => {
  it('counts by dataSource', () => {
    const counts = countByDataSource(sample)
    expect(counts.jumman04).toBe(1)
    expect(counts.demo_corridor).toBe(1)
    expect(counts.demo_synthetic).toBe(1)
    expect(counts.bd_json).toBe(1)
  })

  it('filters by dataSource subset', () => {
    const filtered = filterAdminLocations(sample, {
      dataSources: ['demo_synthetic'],
      type: 'all',
      search: '',
    })
    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.dataSource).toBe('demo_synthetic')
  })

  it('filters by type and search', () => {
    const filtered = filterAdminLocations(sample, {
      dataSources: [...LOCATION_DATA_SOURCES],
      type: 'union',
      search: 'ghona',
    })
    expect(filtered.map((l) => l.id)).toEqual([D.unionGhona])
  })

  it('paginates filtered rows', () => {
    const many = Array.from({ length: 120 }, (_, i) => ({
      ...sample[0]!,
      id: `loc-${i}`,
    }))
    expect(adminLocationPageCount(many.length)).toBe(3)
    expect(paginateAdminLocations(many, 2)).toHaveLength(20)
  })
})
