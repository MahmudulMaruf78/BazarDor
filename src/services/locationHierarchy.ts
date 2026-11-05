import type { Location } from '@/types/domain/records'

const TYPE_ORDER: Record<Location['type'], number> = {
  division: 0,
  district: 1,
  upazila: 2,
  union: 3,
}

export function locationPathFromRoot(leafId: string, locations: readonly Location[]): Location[] {
  const byId = new Map(locations.map((loc) => [loc.id, loc]))
  const path: Location[] = []
  let current = byId.get(leafId)
  while (current) {
    path.push(current)
    current = current.parentId ? byId.get(current.parentId) : undefined
  }
  return path.sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type])
}

export function formatLocationChain(
  leafId: string,
  locations: readonly Location[],
  labelFn: (loc: Location) => string,
): string {
  return locationPathFromRoot(leafId, locations).map(labelFn).join(' · ')
}

export function directChildLocations(
  parentId: string | undefined,
  locations: readonly Location[],
): Location[] {
  const children =
    parentId === undefined
      ? locations.filter((loc) => !loc.parentId && loc.type === 'division')
      : locations.filter((loc) => loc.parentId === parentId)
  return [...children].sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type])
}

export function hasDirectChildren(locationId: string, locations: readonly Location[]): boolean {
  return locations.some((loc) => loc.parentId === locationId)
}
