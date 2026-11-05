import {
  idbClearStore,
  idbCount,
  idbGetMeta,
  idbPutMany,
  idbPutSyncQueue,
  idbSetMeta,
} from '@/data/adapters/indexeddb/client'
import { IDB_STORES } from '@/data/adapters/indexeddb/stores'
import { demoSeedBundle } from '@/data/seed'
import {
  auditLogSchema,
  bidSchema,
  categorySchema,
  farmerProfileSchema,
  listingSchema,
  locationSchema,
  notificationSchema,
  priceEntrySchema,
  productSchema,
  productVariantSchema,
  syncQueueItemSchema,
  transactionSchema,
  unitSchema,
  userSchema,
} from '@/schemas/domain'
import { STORAGE_SCHEMA_VERSION } from '@/constants/storage'
import { err, ok, type RepositoryResult } from '@/types/result'
import type { z } from 'zod'

const META_SCHEMA_VERSION = 'schemaVersion'

function validateMany<T>(schema: z.ZodType<T>, rows: readonly unknown[], label: string): RepositoryResult<T[]> {
  const parsed: T[] = []
  for (const row of rows) {
    const result = schema.safeParse(row)
    if (!result.success) {
      return err({
        code: 'VALIDATION',
        message: `Invalid ${label} seed record.`,
        details: result.error.flatten(),
      })
    }
    parsed.push(result.data)
  }
  return ok(parsed)
}

export function validateDemoSeedBundle(): RepositoryResult<typeof demoSeedBundle> {
  const checks: RepositoryResult<unknown>[] = [
    validateMany(categorySchema, demoSeedBundle.categories, 'category'),
    validateMany(unitSchema, demoSeedBundle.units, 'unit'),
    validateMany(locationSchema, demoSeedBundle.locations, 'location'),
    validateMany(productSchema, demoSeedBundle.products, 'product'),
    validateMany(productVariantSchema, demoSeedBundle.productVariants, 'product variant'),
    validateMany(userSchema, demoSeedBundle.users, 'user'),
    validateMany(farmerProfileSchema, demoSeedBundle.farmerProfiles, 'farmer profile'),
    validateMany(listingSchema, demoSeedBundle.listings, 'listing'),
    validateMany(priceEntrySchema, demoSeedBundle.priceEntries, 'price entry'),
    validateMany(bidSchema, demoSeedBundle.bids, 'bid'),
    validateMany(transactionSchema, demoSeedBundle.transactions, 'transaction'),
    validateMany(notificationSchema, demoSeedBundle.notifications, 'notification'),
    validateMany(syncQueueItemSchema, demoSeedBundle.syncQueue, 'sync queue item'),
    validateMany(auditLogSchema, demoSeedBundle.auditLogs, 'audit log'),
  ]
  for (const check of checks) {
    if (!check.ok) return check
  }
  return ok(demoSeedBundle)
}

async function writeSeedToIndexedDb(bundle: typeof demoSeedBundle): Promise<RepositoryResult<void>> {
  try {
    // ponytail: structuredClone so imported seed objects are never mutated in place
    const clone = structuredClone(bundle) as typeof demoSeedBundle
    await idbPutMany(IDB_STORES.categories, [...clone.categories])
    await idbPutMany(IDB_STORES.units, [...clone.units])
    await idbPutMany(IDB_STORES.locations, [...clone.locations])
    await idbPutMany(IDB_STORES.products, [...clone.products])
    await idbPutMany(IDB_STORES.productVariants, [...clone.productVariants])
    await idbPutMany(IDB_STORES.users, [...clone.users])
    await idbPutMany(IDB_STORES.farmerProfiles, [...clone.farmerProfiles])
    await idbPutMany(IDB_STORES.listings, [...clone.listings])
    await idbPutMany(IDB_STORES.priceEntries, [...clone.priceEntries])
    await idbPutMany(IDB_STORES.bids, [...clone.bids])
    await idbPutMany(IDB_STORES.transactions, [...clone.transactions])
    await idbPutMany(IDB_STORES.notifications, [...clone.notifications])
    await idbPutSyncQueue([...clone.syncQueue])
    await idbPutMany(IDB_STORES.auditLogs, [...clone.auditLogs])
    await idbSetMeta(META_SCHEMA_VERSION, STORAGE_SCHEMA_VERSION)
    return ok(undefined)
  } catch (cause) {
    return err({ code: 'STORAGE', message: 'Failed to write demo seed to IndexedDB.', details: cause })
  }
}

export async function resetDemoData(): Promise<RepositoryResult<void>> {
  const validated = validateDemoSeedBundle()
  if (!validated.ok) return validated
  for (const store of Object.values(IDB_STORES)) {
    if (store === IDB_STORES.meta) continue
    await idbClearStore(store)
  }
  return writeSeedToIndexedDb(validated.data)
}

export async function initializeDemoData(): Promise<RepositoryResult<void>> {
  const validated = validateDemoSeedBundle()
  if (!validated.ok) return validated

  try {
    const version = await idbGetMeta(META_SCHEMA_VERSION)
    const userCount = await idbCount(IDB_STORES.users)
    const variantCount = await idbCount(IDB_STORES.productVariants)
    const listingCount = await idbCount(IDB_STORES.listings)
    if (
      version === STORAGE_SCHEMA_VERSION &&
      userCount > 0 &&
      variantCount > 0 &&
      listingCount > 0
    ) {
      return ok(undefined)
    }
    return resetDemoData()
  } catch (cause) {
    return err({ code: 'STORAGE', message: 'Failed to initialize demo data.', details: cause })
  }
}

export async function readStorageSchemaVersion(): Promise<RepositoryResult<number | null>> {
  try {
    const version = await idbGetMeta(META_SCHEMA_VERSION)
    return ok(typeof version === 'number' ? version : null)
  } catch (cause) {
    return err({ code: 'STORAGE', message: 'Could not read storage schema version.', details: cause })
  }
}
