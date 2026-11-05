import { describe, expect, it } from 'vitest'
import {
  buildApprovedEntry,
  buildRejectedEntry,
  canApprovePriceEntry,
  canRejectPriceEntry,
} from '@/services/approvalService'
import { isConsentEligibleForApproval } from '@/services/consentService'
import { makePriceEntry } from '@/test/fixtures/pricingFixtures'

describe('consentService', () => {
  it('blocks assisted entries until consent verified', () => {
    const pending = makePriceEntry({
      id: 'pe-assisted',
      farmerId: 'user-farmer-3',
      submittedByUserId: 'user-fo-1',
      submittedAt: '2026-11-04T07:30:00+06:00',
      isAssisted: true,
      consentStatus: 'pending',
      approvalStatus: 'pending',
    })
    expect(isConsentEligibleForApproval(pending)).toBe(false)
  })
})

describe('approvalService', () => {
  it('blocks self-approval by submitting officer', () => {
    const entry = makePriceEntry({
      id: 'pe-self',
      farmerId: 'user-farmer-3',
      submittedByUserId: 'user-fo-1',
      submittedAt: '2026-11-04T07:30:00+06:00',
      approvalStatus: 'pending',
      isAssisted: true,
      consentStatus: 'verified',
    })
    expect(canApprovePriceEntry(entry, 'user-fo-1').ok).toBe(false)
  })

  it('requires rejection reason', () => {
    const entry = makePriceEntry({
      id: 'pe-reject',
      farmerId: 'user-farmer-3',
      submittedAt: '2026-11-04T07:30:00+06:00',
      approvalStatus: 'pending',
    })
    expect(canRejectPriceEntry(entry).ok).toBe(true)
    expect(buildRejectedEntry(entry, '   ', '2026-11-04T08:00:00+06:00').ok).toBe(false)
    const rejected = buildRejectedEntry(entry, 'Out of range', '2026-11-04T08:00:00+06:00')
    expect(rejected.ok && rejected.data.rejectionReason).toBe('Out of range')
  })

  it('approves with timestamps', () => {
    const entry = makePriceEntry({
      id: 'pe-approve',
      farmerId: 'user-farmer-1',
      submittedAt: '2026-11-04T07:30:00+06:00',
      approvalStatus: 'pending',
    })
    const approved = buildApprovedEntry(entry, '2026-11-04T08:00:00+06:00', '2026-11-05T08:00:00+06:00')
    expect(approved.approvalStatus).toBe('approved')
    expect(approved.freshnessStatus).toBe('active')
  })
})
