import raw from '@/data/bangladesh-locations.json'
import type { Location, LocationDataSource } from '@/types/domain/records'

export type BangladeshLocationNode = {
  id: string
  type: Location['type']
  nameEn: string
  nameBn: string
  dataSource: LocationDataSource
  officialId?: string
  bbsCode?: string
  demoCentroid?: Location['demoCentroid']
  mapBoundaryId?: string
  children?: BangladeshLocationNode[]
}

export type BangladeshLocationSelection = {
  divisionId: string
  districtId?: string
  upazilaId?: string
  unionId?: string
}

type JsonRoot = {
  divisions: BangladeshLocationNode[]
}

const root = raw as JsonRoot

const byId = new Map<string, BangladeshLocationNode>()
const parentById = new Map<string, string | undefined>()

function indexTree(nodes: BangladeshLocationNode[], parentId?: string) {
  for (const node of nodes) {
    byId.set(node.id, node)
    parentById.set(node.id, parentId)
    if (node.children?.length) indexTree(node.children, node.id)
  }
}

indexTree(root.divisions)

export function getBangladeshLocationById(id: string): BangladeshLocationNode | undefined {
  return byId.get(id)
}

export function getBangladeshLocationParentId(id: string): string | undefined {
  return parentById.get(id)
}

export function listBangladeshDivisions(): BangladeshLocationNode[] {
  return root.divisions
}

const CHILD_TYPE_BY_PARENT: Record<Location['type'], Location['type']> = {
  division: 'district',
  district: 'upazila',
  upazila: 'union',
  union: 'union',
}

export function isBangladeshLocationChildOf(childId: string, parentId: string): boolean {
  return getBangladeshLocationParentId(childId) === parentId
}

/** Direct children only — filtered by expected admin level (ID parent chain). */
export function getBangladeshChildren(parentId: string | undefined): BangladeshLocationNode[] {
  if (parentId == null || parentId === '') {
    return root.divisions.filter((node) => node.type === 'division')
  }
  const parent = byId.get(parentId)
  if (!parent) return []
  const expectedType = CHILD_TYPE_BY_PARENT[parent.type]
  return (parent.children ?? []).filter((node) => node.type === expectedType)
}

export function getBangladeshPathIds(leafOrNodeId: string): string[] {
  const path: string[] = []
  let current: string | undefined = leafOrNodeId
  while (current) {
    path.unshift(current)
    current = parentById.get(current)
  }
  return path
}

export function selectionFromLocationId(locationId: string): BangladeshLocationSelection | undefined {
  const path = getBangladeshPathIds(locationId)
  if (path.length === 0) return undefined
  const divisionId = path[0]
  if (!divisionId) return undefined
  return {
    divisionId,
    districtId: path[1],
    upazilaId: path[2],
    unionId: path[3],
  }
}

export function leafLocationId(sel: BangladeshLocationSelection): string | undefined {
  return sel.unionId ?? sel.upazilaId ?? sel.districtId ?? sel.divisionId
}

export function pickBangladeshName(node: BangladeshLocationNode, locale: 'en' | 'bn'): string {
  return locale === 'bn' ? node.nameBn : node.nameEn
}

/** Union dropdown label; appends i18n Demo suffix for synthetic placeholders only. */
export function formatBangladeshLocationLabel(
  node: BangladeshLocationNode,
  locale: 'en' | 'bn',
  syntheticDemoSuffix?: string,
): string {
  const base = pickBangladeshName(node, locale)
  if (node.type === 'union' && node.dataSource === 'demo_synthetic' && syntheticDemoSuffix) {
    return `${base} ${syntheticDemoSuffix}`
  }
  return base
}

export function listAllBangladeshLocationNodes(): BangladeshLocationNode[] {
  return [...byId.values()]
}

export function countBangladeshLocationsByType(): Record<Location['type'], number> {
  const counts: Record<Location['type'], number> = {
    division: 0,
    district: 0,
    upazila: 0,
    union: 0,
  }
  for (const node of byId.values()) counts[node.type] += 1
  return counts
}

/** Deepest location id for scope filters (union → upazila → district → division). */
export function deepestScopeLocationId(sel: BangladeshLocationSelection): string {
  return sel.unionId ?? sel.upazilaId ?? sel.districtId ?? sel.divisionId
}

export const bangladeshLocationCounts = {
  divisions: root.divisions.length,
  indexed: byId.size,
}
