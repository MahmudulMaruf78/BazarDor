import type { PriceEntry } from '@/types/domain/records'
import { isConsentEligibleForApproval } from './consentService'
import { serviceErr, serviceOk, type ServiceResult } from './types'

export function canApprovePriceEntry(
  entry: PriceEntry,
  approverUserId: string,
): ServiceResult<void> {
  if (entry.approvalStatus !== 'pending') {
    return serviceErr({ code: 'VALIDATION', message: 'Only pending entries can be approved.' })
  }
  if (entry.submittedByUserId === approverUserId) {
    return serviceErr({
      code: 'FORBIDDEN',
      message: 'Field officer cannot approve an entry they submitted.',
    })
  }
  if (!isConsentEligibleForApproval(entry)) {
    return serviceErr({
      code: 'FORBIDDEN',
      message: 'Consent must be verified before approval.',
    })
  }
  return serviceOk(undefined)
}

export function canRejectPriceEntry(entry: PriceEntry): ServiceResult<void> {
  if (entry.approvalStatus !== 'pending') {
    return serviceErr({ code: 'VALIDATION', message: 'Only pending entries can be rejected.' })
  }
  return serviceOk(undefined)
}

export function buildRejectedEntry(entry: PriceEntry, reason: string, rejectedAt: string): ServiceResult<PriceEntry> {
  const trimmed = reason.trim()
  if (!trimmed) {
    return serviceErr({ code: 'VALIDATION', message: 'Rejection requires a reason.' })
  }
  return serviceOk({
    ...entry,
    approvalStatus: 'rejected',
    rejectedAt,
    rejectionReason: trimmed,
  })
}

export function buildApprovedEntry(entry: PriceEntry, approvedAt: string, expiresAt: string): PriceEntry {
  return {
    ...entry,
    approvalStatus: 'approved',
    approvedAt,
    expiresAt,
    freshnessStatus: 'active',
  }
}
