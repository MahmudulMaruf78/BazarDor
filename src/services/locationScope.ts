import type { Location } from '@/types/domain/records'

export function buildLocationChildrenIndex(locations: readonly Location[]): Map<string, string[]> {
  const children = new Map<string, string[]>()
  for (const location of locations) {
    if (!location.parentId) continue
    const list = children.get(location.parentId) ?? []
    list.push(location.id)
    children.set(location.parentId, list)
  }
  return children
}

/** Parent scope includes the scope id plus all descendant location ids. */
export function expandLocationScope(scopeLocationId: string, locations: readonly Location[]): string[] {
  const children = buildLocationChildrenIndex(locations)
  const scope = new Set<string>([scopeLocationId])
  const queue = [scopeLocationId]

  while (queue.length > 0) {
    const current = queue.pop()!
    for (const childId of children.get(current) ?? []) {
      if (scope.has(childId)) continue
      scope.add(childId)
      queue.push(childId)
    }
  }

  return [...scope]
}

export function isLocationInScope(entryLocationId: string, scopeLocationId: string, locations: readonly Location[]): boolean {
  const scopeIds = expandLocationScope(scopeLocationId, locations)
  return scopeIds.includes(entryLocationId)
}
