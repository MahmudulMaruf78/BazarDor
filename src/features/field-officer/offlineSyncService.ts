import { dataLayer } from '@/data'
import type { SyncQueueItem } from '@/types/domain/records'
import { err, ok, type RepositoryResult } from '@/types/result'

function queueId() {
  return `client-pe-${crypto.randomUUID()}`
}

export async function saveOfflineDraft(payload: Record<string, unknown>): Promise<RepositoryResult<SyncQueueItem>> {
  const item: SyncQueueItem = {
    clientEntryId: queueId(),
    entityType: 'priceEntry',
    payload,
    status: 'DRAFT',
    updatedAt: new Date().toISOString(),
  }
  return dataLayer.repos.syncQueue.saveSyncQueueItem(item)
}

export async function queueDraftForSync(clientEntryId: string): Promise<RepositoryResult<SyncQueueItem>> {
  const items = await dataLayer.repos.syncQueue.listSyncQueue()
  if (!items.ok) return items
  const item = items.data.find((row) => row.clientEntryId === clientEntryId)
  if (!item) return err({ code: 'NOT_FOUND', message: 'Queue item not found.' })
  return dataLayer.repos.syncQueue.saveSyncQueueItem({
    ...item,
    status: 'PENDING_SYNC',
    updatedAt: new Date().toISOString(),
  })
}

/** ponytail: mock sync — same browser/device only, no server. */
export async function mockSyncQueue(options?: { failClientEntryId?: string }): Promise<
  RepositoryResult<SyncQueueItem[]>
> {
  const items = await dataLayer.repos.syncQueue.listSyncQueue()
  if (!items.ok) return items

  const updated: SyncQueueItem[] = []
  for (const item of items.data) {
    if (item.status !== 'PENDING_SYNC' && item.status !== 'FAILED') {
      updated.push(item)
      continue
    }

    const syncing: SyncQueueItem = { ...item, status: 'SYNCING', updatedAt: new Date().toISOString() }
    await dataLayer.repos.syncQueue.saveSyncQueueItem(syncing)

    if (options?.failClientEntryId === item.clientEntryId) {
      const failed: SyncQueueItem = {
        ...syncing,
        status: 'FAILED',
        errorDetail: 'Sync failure — retry available on this device only.',
        updatedAt: new Date().toISOString(),
      }
      await dataLayer.repos.syncQueue.saveSyncQueueItem(failed)
      updated.push(failed)
      continue
    }

    const synced: SyncQueueItem = {
      ...syncing,
      status: 'SYNCED',
      errorDetail: undefined,
      updatedAt: new Date().toISOString(),
    }
    await dataLayer.repos.syncQueue.saveSyncQueueItem(synced)
    updated.push(synced)
  }

  return ok(updated)
}

export async function markQueueConflict(clientEntryId: string): Promise<RepositoryResult<SyncQueueItem>> {
  const items = await dataLayer.repos.syncQueue.listSyncQueue()
  if (!items.ok) return items
  const item = items.data.find((row) => row.clientEntryId === clientEntryId)
  if (!item) return err({ code: 'NOT_FOUND', message: 'Queue item not found.' })
  return dataLayer.repos.syncQueue.saveSyncQueueItem({
    ...item,
    status: 'CONFLICT',
    errorDetail: 'Sync conflict — review required on this device.',
    updatedAt: new Date().toISOString(),
  })
}

export async function listSyncQueueItems(): Promise<RepositoryResult<SyncQueueItem[]>> {
  return dataLayer.repos.syncQueue.listSyncQueue()
}
