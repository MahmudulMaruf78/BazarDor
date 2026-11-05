import type { Product, Unit } from '@/types/domain/records'
import { serviceErr, serviceOk, type ServiceResult } from './types'

/** Master Plan conversion table (base unit kg). */
export const KG_PER_UNIT_CODE: Record<string, number> = {
  kg: 1,
  maund: 40,
  quintal: 100,
  tonne: 1000,
}

export function kgPerUnitFor(unit: Unit): ServiceResult<number> {
  const fromCode = KG_PER_UNIT_CODE[unit.code]
  if (fromCode !== undefined && fromCode === unit.kgPerUnit) {
    return serviceOk(unit.kgPerUnit)
  }
  if (fromCode !== undefined) {
    return serviceOk(fromCode)
  }
  if (unit.kgPerUnit > 0) {
    return serviceOk(unit.kgPerUnit)
  }
  return serviceErr({ code: 'VALIDATION', message: 'Invalid unit conversion.' })
}

export function isUnitAllowedForProduct(product: Product, unitId: string): boolean {
  return product.allowedUnitIds.includes(unitId)
}

export function convertQuantityToKg(quantity: number, unit: Unit): ServiceResult<number> {
  if (quantity <= 0) {
    return serviceErr({ code: 'VALIDATION', message: 'Quantity must be positive.' })
  }
  const kgPerUnit = kgPerUnitFor(unit)
  if (!kgPerUnit.ok) return kgPerUnit
  return serviceOk(quantity * kgPerUnit.data)
}
