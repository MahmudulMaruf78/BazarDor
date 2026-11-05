import { describe, expect, it } from 'vitest'
import {
  resolveProductId,
  type ProductComboboxOption,
} from '@/components/common/productComboboxResolve'
import { seedProducts } from '@/data/seed'

const products = seedProducts

describe('product combobox resolve', () => {
  const displayName = (p: ProductComboboxOption) => p.nameEn

  it('resolves id and English name', () => {
    expect(resolveProductId('prod-banana', products, displayName)).toBe('prod-banana')
    expect(resolveProductId('Sabri Banana', products, displayName)).toBe('prod-banana')
  })

  it('resolves partial English name', () => {
    expect(resolveProductId('banana', products, displayName)).toBe('prod-banana')
  })
})
