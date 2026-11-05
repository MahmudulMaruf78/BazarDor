import { describe, expect, it } from 'vitest'
import { seedProducts, seedUnits } from '@/data/seed'
import { normalizeMarketPrice } from '@/services/priceNormalization'
import { KG_PER_UNIT_CODE, convertQuantityToKg } from '@/services/unitConversion'

describe('unitConversion', () => {
  it('converts maund quintal tonne to kg', () => {
    expect(KG_PER_UNIT_CODE.maund).toBe(40)
    expect(KG_PER_UNIT_CODE.quintal).toBe(100)
    expect(KG_PER_UNIT_CODE.tonne).toBe(1000)
    const maund = seedUnits.find((unit) => unit.code === 'maund')!
    expect(convertQuantityToKg(2, maund)).toEqual({ ok: true, data: 80 })
  })

  it('rejects non-positive quantity', () => {
    const kg = seedUnits.find((unit) => unit.code === 'kg')!
    expect(convertQuantityToKg(0, kg).ok).toBe(false)
  })
})

describe('priceNormalization', () => {
  it('normalizes total price to per-kg', () => {
    const product = seedProducts.find((p) => p.id === 'prod-paddy')!
    const maund = seedUnits.find((unit) => unit.code === 'maund')!
    const result = normalizeMarketPrice({
      product,
      unit: maund,
      reportedQuantity: 1,
      reportedTotalPrice: 3280,
    })
    expect(result).toEqual({
      ok: true,
      data: { normalizedQuantityKg: 40, normalizedPricePerKg: 82 },
    })
  })

  it('rejects incompatible unit for product', () => {
    const potato = seedProducts.find((p) => p.id === 'prod-potato')!
    const quintal = seedUnits.find((unit) => unit.code === 'quintal')!
    expect(
      normalizeMarketPrice({
        product: potato,
        unit: quintal,
        reportedQuantity: 1,
        reportedTotalPrice: 1000,
      }).ok,
    ).toBe(false)
  })
})
