import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { IDB_NAME, IDB_VERSION } from '@/constants/storage'
import { IDB_STORES, type IdbStoreName } from './stores'
import type {
  AuditLogEntry,
  Bid,
  Category,
  FarmerProfile,
  Listing,
  Location,
  Notification,
  PriceEntry,
  Product,
  SyncQueueItem,
  Transaction,
  Unit,
  User,
} from '@/types/domain/records'

type MetaRecord = { key: string; value: unknown }

interface BazarDorDb extends DBSchema {
  meta: { key: string; value: MetaRecord; indexes: { 'by-key': string } }
  users: { key: string; value: User }
  farmerProfiles: { key: string; value: FarmerProfile }
  categories: { key: string; value: Category }
  units: { key: string; value: Unit }
  locations: { key: string; value: Location }
  products: { key: string; value: Product }
  listings: { key: string; value: Listing }
  priceEntries: { key: string; value: PriceEntry }
  bids: { key: string; value: Bid }
  transactions: { key: string; value: Transaction }
  notifications: { key: string; value: Notification }
  syncQueue: { key: string; value: SyncQueueItem }
  auditLogs: { key: string; value: AuditLogEntry }
}

let dbPromise: Promise<IDBPDatabase<BazarDorDb>> | null = null

export function getIndexedDb() {
  if (!dbPromise) {
    dbPromise = openDB<BazarDorDb>(IDB_NAME, IDB_VERSION, {
      upgrade(db) {
        for (const store of Object.values(IDB_STORES)) {
          if (!db.objectStoreNames.contains(store)) {
            if (store === IDB_STORES.meta) {
              db.createObjectStore(IDB_STORES.meta, { keyPath: 'key' })
            } else if (store === IDB_STORES.syncQueue) {
              db.createObjectStore(IDB_STORES.syncQueue, { keyPath: 'clientEntryId' })
            } else {
              db.createObjectStore(store, { keyPath: 'id' })
            }
          }
        }
      },
    })
  }
  return dbPromise
}

export async function idbGetMeta(key: string): Promise<unknown | undefined> {
  const db = await getIndexedDb()
  const row = await db.get(IDB_STORES.meta, key)
  return row?.value
}

export async function idbSetMeta(key: string, value: unknown): Promise<void> {
  const db = await getIndexedDb()
  await db.put(IDB_STORES.meta, { key, value })
}

export async function idbClearStore(store: IdbStoreName): Promise<void> {
  const db = await getIndexedDb()
  await db.clear(store)
}

export async function idbPutMany<T extends { id: string }>(
  store: Exclude<IdbStoreName, 'meta' | 'syncQueue'>,
  rows: readonly T[],
): Promise<void> {
  const db = await getIndexedDb()
  const tx = db.transaction(store, 'readwrite')
  await Promise.all(rows.map((row) => tx.store.put(row as never)))
  await tx.done
}

export async function idbPutSyncQueue(rows: readonly SyncQueueItem[]): Promise<void> {
  const db = await getIndexedDb()
  const tx = db.transaction(IDB_STORES.syncQueue, 'readwrite')
  await Promise.all(rows.map((row) => tx.store.put(row)))
  await tx.done
}

export async function idbGetAll<T>(store: Exclude<IdbStoreName, 'meta'>): Promise<T[]> {
  const db = await getIndexedDb()
  return (await db.getAll(store)) as T[]
}

export async function idbCount(store: Exclude<IdbStoreName, 'meta'>): Promise<number> {
  const db = await getIndexedDb()
  return db.count(store)
}
