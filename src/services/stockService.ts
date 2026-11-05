import type { Listing, Transaction } from '@/types/domain/records'
import { serviceErr, serviceOk, type ServiceResult } from './types'

export function validateAvailableStock(listing: Listing, requestedQuantity: number): ServiceResult<void> {
  if (requestedQuantity <= 0) {
    return serviceErr({ code: 'VALIDATION', message: 'Quantity must be positive.' })
  }
  if (requestedQuantity > listing.availableQuantity) {
    return serviceErr({ code: 'VALIDATION', message: 'Insufficient available stock.' })
  }
  return serviceOk(undefined)
}

export function reserveListingStock(listing: Listing, quantity: number): ServiceResult<Listing> {
  const valid = validateAvailableStock(listing, quantity)
  if (!valid.ok) return valid

  const nextAvailable = listing.availableQuantity - quantity
  const nextReserved = listing.reservedQuantity + quantity
  if (nextAvailable < 0 || nextReserved < 0) {
    return serviceErr({ code: 'CONFLICT', message: 'Stock would become negative.' })
  }

  return serviceOk({
    ...listing,
    availableQuantity: nextAvailable,
    reservedQuantity: nextReserved,
    status: nextAvailable === 0 ? 'sold_out' : listing.status,
  })
}

export function releaseListingReservation(listing: Listing, quantity: number): ServiceResult<Listing> {
  if (quantity <= 0) {
    return serviceErr({ code: 'VALIDATION', message: 'Quantity must be positive.' })
  }
  if (quantity > listing.reservedQuantity) {
    return serviceErr({ code: 'VALIDATION', message: 'Cannot release more than reserved stock.' })
  }

  return serviceOk({
    ...listing,
    availableQuantity: listing.availableQuantity + quantity,
    reservedQuantity: listing.reservedQuantity - quantity,
    status: listing.availableQuantity + quantity > 0 ? 'active' : listing.status,
  })
}

export function completeListingSale(listing: Listing, quantity: number, transaction: Transaction): ServiceResult<Listing> {
  if (transaction.status !== 'awaiting_completion_confirmation' && transaction.status !== 'completed') {
    return serviceErr({ code: 'VALIDATION', message: 'Transaction is not eligible for stock completion.' })
  }
  if (!transaction.buyerConfirmedAt || !transaction.sellerConfirmedAt) {
    return serviceErr({ code: 'VALIDATION', message: 'Both buyer and seller confirmation required.' })
  }
  if (quantity <= 0 || quantity > listing.reservedQuantity) {
    return serviceErr({ code: 'VALIDATION', message: 'Invalid completion quantity.' })
  }

  return serviceOk({
    ...listing,
    reservedQuantity: listing.reservedQuantity - quantity,
    completedQuantity: listing.completedQuantity + quantity,
  })
}

export function isTransactionCompleted(transaction: Transaction): boolean {
  return Boolean(transaction.buyerConfirmedAt && transaction.sellerConfirmedAt)
}
