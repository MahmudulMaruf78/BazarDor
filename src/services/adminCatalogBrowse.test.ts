import { describe, expect, it } from 'vitest'
import { filterAdminProducts, filterAdminUnits } from '@/services/adminCatalogBrowse'
import type { Product, Unit } from '@/types/domain/records'

const products: Product[] = [
  {
    id: 'prod-paddy',
    categoryId: 'cat-grain',
    nameEn: 'Paddy',
    nameBn: 'ধান',
    allowedUnitIds: ['unit-kg'],
    imageUrl: '/demo-products/paddy.png',
  },
  {
    id: 'prod-banana',
    categoryId: 'cat-fruit',
    nameEn: 'Banana',
    nameBn: 'কলা',
    allowedUnitIds: ['unit-kg'],
    imageUrl: '/demo-products/banana.png',
  },
]

const units: Unit[] = [
  { id: 'unit-kg', code: 'kg', nameEn: 'Kilogram', nameBn: 'কেজি', kgPerUnit: 1 },
  { id: 'unit-maund', code: 'maund', nameEn: 'Maund', nameBn: 'মণ', kgPerUnit: 40 },
]

describe('adminCatalogBrowse', () => {
  it('filters products by category', () => {
    const filtered = filterAdminProducts(products, { categoryId: 'cat-fruit', search: '' })
    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.id).toBe('prod-banana')
  })

  it('filters products by search', () => {
    const filtered = filterAdminProducts(products, { categoryId: 'all', search: 'paddy' })
    expect(filtered.map((p) => p.id)).toEqual(['prod-paddy'])
  })

  it('filters units by code or name', () => {
    expect(filterAdminUnits(units, { search: 'maund' })).toHaveLength(1)
    expect(filterAdminUnits(units, { search: 'কেজি' })).toHaveLength(1)
  })
})
