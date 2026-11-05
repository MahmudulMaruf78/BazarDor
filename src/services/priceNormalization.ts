import type { Product, Unit } from '@/types/domain/records'
import { convertQuantityToKg, isUnitAllowedForProduct } from './unitConversion'
import { serviceErr, serviceOk, type ServiceResult } from './types'

export type NormalizePriceInput = {
  product: Product
  unit: Unit
  reportedQuantity: number
  reportedTotalPrice: number
}

export type NormalizedPrice = {
  normalizedQuantityKg: number
  normalizedPricePerKg: number
}

export function normalizeMarketPrice(input: NormalizePriceInput): ServiceResult<NormalizedPrice> {
  if (input.reportedTotalPrice <= 0) {
    return serviceErr({ code: 'VALIDATION', message: 'Total price must be positive.' })
  }
  if (!isUnitAllowedForProduct(input.product, input.unit.id)) {
    return serviceErr({ code: 'VALIDATION', message: 'Unit is not allowed for this product.' })
  }

  const quantityKg = convertQuantityToKg(input.reportedQuantity, input.unit)
  if (!quantityKg.ok) return quantityKg

  return serviceOk({
    normalizedQuantityKg: quantityKg.data,
    normalizedPricePerKg: input.reportedTotalPrice / quantityKg.data,
  })
}
