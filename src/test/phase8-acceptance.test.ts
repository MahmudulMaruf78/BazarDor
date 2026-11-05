import { beforeEach, describe, expect, it } from 'vitest'
import { resetDemoData, validateDemoSeedBundle } from '@/data/bootstrap/demoDataLifecycle'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'
import { demoSeedBundle } from '@/data/seed'
import {
  markQueueConflict,
  mockSyncQueue,
  queueDraftForSync,
  saveOfflineDraft,
} from '@/features/field-officer/offlineSyncService'
import { dataLayer } from '@/data'

describe('Phase 8 acceptance', () => {
  beforeEach(async () => {
    expect((await resetDemoData()).ok).toBe(true)
  })

  it('validates full demo seed bundle', () => {
    const result = validateDemoSeedBundle()
    expect(result.ok).toBe(true)
  })

  it('keeps QR identifiers non-sensitive in farmer profiles', () => {
    for (const profile of demoSeedBundle.farmerProfiles) {
      expect(profile.qrProfileId.startsWith('fp-')).toBe(true)
      expect(profile.qrProfileId).not.toMatch(/^01\d/)
    }
  })

  it('uses fictional phone placeholders on users only', () => {
    for (const user of demoSeedBundle.users) {
      expect(user.phonePlaceholder).toMatch(/^01XX-/)
    }
  })

  it('records failed sync and conflict queue states', async () => {
    const draft = await saveOfflineDraft({ demo: true })
    expect(draft.ok).toBe(true)
    if (!draft.ok) return

    const queued = await queueDraftForSync(draft.data.clientEntryId)
    expect(queued.ok && queued.data.status).toBe('PENDING_SYNC')

    const failed = await mockSyncQueue({ failClientEntryId: draft.data.clientEntryId })
    expect(failed.ok).toBe(true)
    if (!failed.ok) return
    const row = failed.data.find((item) => item.clientEntryId === draft.data.clientEntryId)
    expect(row?.status).toBe('FAILED')
    expect(row?.errorDetail).toBeTruthy()

    const conflict = await markQueueConflict(draft.data.clientEntryId)
    expect(conflict.ok && conflict.data.status).toBe('CONFLICT')
  })

  it('reset restores seed price entry count', async () => {
    const before = demoSeedBundle.priceEntries.length
    expect((await resetDemoData()).ok).toBe(true)
    const entries = await dataLayer.repos.prices.listPriceEntries()
    expect(entries.ok && entries.data.length).toBe(before)
  })

  it('seeds demo location centroids for regional map corridor', () => {
    const demoIds = [
      D.divisionKhulna,
      D.districtJashore,
      D.upazilaKeshabpur,
      D.upazilaMonirampur,
      D.unionGhona,
      D.unionDurgapur,
    ]
    const byId = new Map(demoSeedBundle.locations.map((loc) => [loc.id, loc]))
    for (const id of demoIds) {
      expect(byId.get(id)?.demoCentroid).toBeTruthy()
    }
    expect(demoSeedBundle.locations.filter((loc) => loc.type === 'division')).toHaveLength(8)
  })

  it('seeds audit trail rows for verification demo', async () => {
    const logs = await dataLayer.repos.auditLogs.listAuditLogs()
    expect(logs.ok && logs.data.length).toBeGreaterThanOrEqual(2)
  })
})
