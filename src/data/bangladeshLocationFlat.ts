import type { BangladeshLocationNode } from '@/data/bangladeshLocationIndex'
import { listBangladeshDivisions } from '@/data/bangladeshLocationIndex'
import type { Location } from '@/types/domain/records'

function flattenNode(node: BangladeshLocationNode, parentId: string | undefined, out: Location[]) {
  out.push({
    id: node.id,
    parentId,
    nameEn: node.nameEn,
    nameBn: node.nameBn,
    type: node.type,
    dataSource: node.dataSource,
    ...(node.officialId ? { officialId: node.officialId } : {}),
    ...(node.bbsCode ? { bbsCode: node.bbsCode } : {}),
    ...(node.demoCentroid ? { demoCentroid: node.demoCentroid } : {}),
    ...(node.mapBoundaryId ? { mapBoundaryId: node.mapBoundaryId } : {}),
  })
  for (const child of node.children ?? []) {
    flattenNode(child, node.id, out)
  }
}

export function flattenToDomainLocations(): Location[] {
  const out: Location[] = []
  for (const div of listBangladeshDivisions()) {
    flattenNode(div, undefined, out)
  }
  return out
}
