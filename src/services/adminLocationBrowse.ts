import type { Location, LocationDataSource } from '@/types/domain/records'

export const LOCATION_DATA_SOURCES: readonly LocationDataSource[] = [
  'jumman04',
  'bd_json',
  'demo_corridor',
  'demo_synthetic',
]

export type AdminLocationTypeFilter = Location['type'] | 'all'

export type AdminLocationBrowseCriteria = {
  dataSources: readonly LocationDataSource[]
  type: AdminLocationTypeFilter
  search: string
}

export function countByDataSource(locations: readonly Location[]): Record<LocationDataSource, number> {
  const counts: Record<LocationDataSource, number> = {
    jumman04: 0,
    bd_json: 0,
    demo_corridor: 0,
    demo_synthetic: 0,
  }
  for (const loc of locations) counts[loc.dataSource] += 1
  return counts
}

export function filterAdminLocations(
  locations: readonly Location[],
  criteria: AdminLocationBrowseCriteria,
): Location[] {
  const q = criteria.search.trim().toLowerCase()
  const sourceSet = new Set(criteria.dataSources)
  return locations.filter((loc) => {
    if (!sourceSet.has(loc.dataSource)) return false
    if (criteria.type !== 'all' && loc.type !== criteria.type) return false
    if (!q) return true
    return (
      loc.id.toLowerCase().includes(q) ||
      loc.nameEn.toLowerCase().includes(q) ||
      loc.nameBn.toLowerCase().includes(q)
    )
  })
}

export const ADMIN_LOCATION_PAGE_SIZE = 50

export function paginateAdminLocations<T>(items: readonly T[], page: number, pageSize = ADMIN_LOCATION_PAGE_SIZE): T[] {
  const safePage = Math.max(0, page)
  const start = safePage * pageSize
  return items.slice(start, start + pageSize)
}

export function adminLocationPageCount(filteredCount: number, pageSize = ADMIN_LOCATION_PAGE_SIZE): number {
  if (filteredCount <= 0) return 1
  return Math.ceil(filteredCount / pageSize)
}
