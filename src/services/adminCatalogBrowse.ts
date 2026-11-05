import type { Category, Product, Unit } from '@/types/domain/records'

export type AdminProductBrowseCriteria = {
  categoryId: string | 'all'
  search: string
}

export type AdminUnitBrowseCriteria = {
  search: string
}

function matchesSearch(q: string, parts: string[]): boolean {
  if (!q) return true
  return parts.some((p) => p.toLowerCase().includes(q))
}

export function filterAdminProducts(
  products: readonly Product[],
  criteria: AdminProductBrowseCriteria,
): Product[] {
  const q = criteria.search.trim().toLowerCase()
  return products.filter((p) => {
    if (criteria.categoryId !== 'all' && p.categoryId !== criteria.categoryId) return false
    return matchesSearch(q, [p.id, p.nameEn, p.nameBn, p.imageUrl])
  })
}

export function filterAdminUnits(units: readonly Unit[], criteria: AdminUnitBrowseCriteria): Unit[] {
  const q = criteria.search.trim().toLowerCase()
  return units.filter((u) => matchesSearch(q, [u.id, u.code, u.nameEn, u.nameBn, String(u.kgPerUnit)]))
}

export function categoryNameById(categories: readonly Category[]): Map<string, Category> {
  return new Map(categories.map((c) => [c.id, c]))
}
