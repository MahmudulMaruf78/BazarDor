import { beforeEach, describe, expect, it } from 'vitest'
import { resetDemoData } from '@/data/bootstrap/demoDataLifecycle'
import {
  approveVerificationEntry,
  createAssistedPriceEntry,
  lookupFarmerByQrProfileId,
  registerAssistedFarmer,
  verifyDemoConsent,
} from '@/features/field-officer/fieldOfficerService'
import { mockSyncQueue, saveOfflineDraft } from '@/features/field-officer/offlineSyncService'
import { isConsentEligibleForApproval } from '@/services/consentService'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'

describe('Phase 6 field officer', () => {
  beforeEach(async () => {
    expect((await resetDemoData()).ok).toBe(true)
  })

  it('blocks approval before consent on assisted entry', async () => {
    const created = await createAssistedPriceEntry({
      officerUserId: 'user-fo-1',
      farmerId: 'user-farmer-1',
      productId: 'prod-paddy',
      locationId: D.upazilaKeshabpur,
      reportedUnitId: 'unit-maund',
      reportedQuantity: 1,
      reportedTotalPrice: 3300,
    })
    expect(created.ok).toBe(true)
    if (!created.ok) return
    expect(isConsentEligibleForApproval(created.data)).toBe(false)

    const approveEarly = await approveVerificationEntry(created.data.id, 'user-fo-2')
    expect(approveEarly.ok).toBe(false)
  })

  it('blocks self-approval by submitting officer', async () => {
    const created = await createAssistedPriceEntry({
      officerUserId: 'user-fo-1',
      farmerId: 'user-farmer-2',
      productId: 'prod-paddy',
      locationId: D.upazilaKeshabpur,
      reportedUnitId: 'unit-kg',
      reportedQuantity: 50,
      reportedTotalPrice: 4000,
    })
    expect(created.ok).toBe(true)
    if (!created.ok) return
    await verifyDemoConsent(created.data.id, 'user-fo-1')

    const selfApprove = await approveVerificationEntry(created.data.id, 'user-fo-1')
    expect(selfApprove.ok).toBe(false)
  })

  it('persists offline queue and mock sync on same device', async () => {
    const draft = await saveOfflineDraft({ farmerId: 'user-farmer-1' })
    expect(draft.ok && draft.data.status).toBe('DRAFT')
    const synced = await mockSyncQueue()
    expect(synced.ok).toBe(true)
  })

  it('registers assisted farmer in assigned area and resolves QR id', async () => {
    const registered = await registerAssistedFarmer({
      officerUserId: 'user-fo-1',
      displayName: 'Test Farmer',
      displayNameBn: 'পরীক্ষা কৃষক',
      locationId: D.upazilaKeshabpur,
      hasPhone: true,
    })
    expect(registered.ok).toBe(true)
    if (!registered.ok) return
    expect(registered.data.qrProfileId.startsWith('demo-')).toBe(true)

    const lookup = await lookupFarmerByQrProfileId(registered.data.qrProfileId)
    expect(lookup.ok && lookup.data.userId).toBe(registered.data.userId)
  })

  it('rejects phone-like QR lookup payloads', async () => {
    const lookup = await lookupFarmerByQrProfileId('01712345678')
    expect(lookup.ok).toBe(false)
  })
})
