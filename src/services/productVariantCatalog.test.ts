import { describe, expect, it } from 'vitest'
import {
  catalogGroupKey,
  defaultVariantId,
  groupListingsByCatalogKey,
  resolveEffectiveVariantId,
} from '@/services/productVariantCatalog'
import type { Listing } from '@/types/domain/records'

function listing(productId: string, variantId?: string): Listing {
  return {
    id: 'l1',
    sellerUserId: 's1',
    productId,
    ...(variantId ? { variantId } : {}),
    locationId: 'loc-a',
    quantity: 10,
    unitId: 'unit-kg',
    availableQuantity: 5,
    reservedQuantity: 0,
    completedQuantity: 0,
    askingPricePerUnit: 10,
    status: 'active',
    createdAt: '2026-01-01T00:00:00+06:00',
  }
}

describe('productVariantCatalog', () => {
  it('defaultVariantId is stable per product', () => {
    expect(defaultVariantId('prod-potato')).toBe('var-prod-potato-standard')
  })

  it('resolveEffectiveVariantId uses listing variant or default', () => {
    expect(resolveEffectiveVariantId(listing('prod-potato'))).toBe('var-prod-potato-standard')
    expect(resolveEffectiveVariantId(listing('prod-potato', 'var-prod-potato-premium'))).toBe(
      'var-prod-potato-premium',
    )
  })

  it('catalogGroupKey combines product and effective variant', () => {
    expect(catalogGroupKey(listing('prod-potato'))).toBe('prod-potato::var-prod-potato-standard')
    expect(catalogGroupKey(listing('prod-potato', 'var-prod-potato-premium'))).toBe(
      'prod-potato::var-prod-potato-premium',
    )
  })

  it('groupListingsByCatalogKey splits variants', () => {
    const groups = groupListingsByCatalogKey([
      { ...listing('prod-potato'), id: 'a', sellerUserId: 's1' },
      { ...listing('prod-potato', 'var-prod-potato-premium'), id: 'b', sellerUserId: 's2' },
      { ...listing('prod-potato', 'var-prod-potato-premium'), id: 'c', sellerUserId: 's3' },
    ])
    expect(groups.size).toBe(2)
    expect(groups.get('prod-potato::var-prod-potato-standard')).toHaveLength(1)
    expect(groups.get('prod-potato::var-prod-potato-premium')).toHaveLength(2)
  })
})
