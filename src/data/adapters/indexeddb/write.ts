import { getIndexedDb } from './client'
import { IDB_STORES, type IdbStoreName } from './stores'

type WritableStore = Exclude<IdbStoreName, 'meta' | 'syncQueue'>

export async function idbPut<T extends { id: string }>(store: WritableStore, row: T): Promise<void> {
  const db = await getIndexedDb()
  await db.put(store, row as never)
}

export async function idbGet<T extends { id: string }>(
  store: WritableStore,
  id: string,
): Promise<T | undefined> {
  const db = await getIndexedDb()
  return (await db.get(store, id)) as T | undefined
}

export async function idbPutSyncItem(row: import('@/types/domain/records').SyncQueueItem): Promise<void> {
  const db = await getIndexedDb()
  await db.put(IDB_STORES.syncQueue, row)
}
