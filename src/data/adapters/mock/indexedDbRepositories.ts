import { idbGetAll } from '@/data/adapters/indexeddb/client'
import { IDB_STORES } from '@/data/adapters/indexeddb/stores'
import { idbGet, idbPut, idbPutSyncItem } from '@/data/adapters/indexeddb/write'
import {
  auditLogSchema,
  bidSchema,
  farmerProfileSchema,
  listingSchema,
  notificationSchema,
  priceEntrySchema,
  syncQueueItemSchema,
  transactionSchema,
  userSchema,
} from '@/schemas/domain'
import type {
  CatalogRepository,
  DomainRepositories,
  MarketplaceRepository,
  NotificationRepository,
  PriceEntryRepository,
  SyncQueueRepository,
  AuditLogRepository,
  UserRepository,
} from '@/data/repositories/interfaces'
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
  ProductVariant,
  SyncQueueItem,
  Transaction,
  Unit,
  User,
} from '@/types/domain/records'
import { err, ok, type RepositoryResult } from '@/types/result'
import type { z } from 'zod'

async function loadStore<T>(store: keyof typeof IDB_STORES, label: string): Promise<RepositoryResult<T[]>> {
  try {
    if (store === 'meta') {
      return err({ code: 'STORAGE', message: 'Invalid store for list operation.' })
    }
    const rows = await idbGetAll<T>(IDB_STORES[store])
    return ok(rows)
  } catch (cause) {
    return err({ code: 'STORAGE', message: `Could not load ${label}.`, details: cause })
  }
}

async function saveRow<T extends { id: string }>(
  store: Exclude<keyof typeof IDB_STORES, 'meta' | 'syncQueue'>,
  schema: z.ZodType<T>,
  row: T,
  label: string,
): Promise<RepositoryResult<T>> {
  const parsed = schema.safeParse(row)
  if (!parsed.success) {
    return err({
      code: 'VALIDATION',
      message: `Invalid ${label}.`,
      details: parsed.error.flatten(),
    })
  }
  try {
    await idbPut(IDB_STORES[store], parsed.data)
    return ok(parsed.data)
  } catch (cause) {
    return err({ code: 'STORAGE', message: `Could not save ${label}.`, details: cause })
  }
}

const catalogRepository: CatalogRepository = {
  listCategories: () => loadStore<Category>('categories', 'categories'),
  listUnits: () => loadStore<Unit>('units', 'units'),
  listLocations: () => loadStore<Location>('locations', 'locations'),
  listProducts: () => loadStore<Product>('products', 'products'),
  listProductVariants: () => loadStore<ProductVariant>('productVariants', 'product variants'),
}

const userRepository: UserRepository = {
  listUsers: () => loadStore<User>('users', 'users'),
  listFarmerProfiles: () => loadStore<FarmerProfile>('farmerProfiles', 'farmer profiles'),
  async getUserById(id) {
    const users = await loadStore<User>('users', 'users')
    if (!users.ok) return users
    const match = users.data.find((user) => user.id === id)
    if (!match) return err({ code: 'NOT_FOUND', message: `User ${id} not found.` })
    return ok(match)
  },
  saveUser: (user) => saveRow('users', userSchema, user, 'user'),
  saveFarmerProfile: (profile) => saveRow('farmerProfiles', farmerProfileSchema, profile, 'farmer profile'),
}

const marketplaceRepository: MarketplaceRepository = {
  listListings: () => loadStore<Listing>('listings', 'listings'),
  async getListingById(id) {
    try {
      const listing = await idbGet<Listing>(IDB_STORES.listings, id)
      if (!listing) return err({ code: 'NOT_FOUND', message: `Listing ${id} not found.` })
      return ok(listing)
    } catch (cause) {
      return err({ code: 'STORAGE', message: 'Could not load listing.', details: cause })
    }
  },
  saveListing: (listing) => saveRow('listings', listingSchema, listing, 'listing'),
  listBids: () => loadStore<Bid>('bids', 'bids'),
  saveBid: (bid) => saveRow('bids', bidSchema, bid, 'bid'),
  listTransactions: () => loadStore<Transaction>('transactions', 'transactions'),
  saveTransaction: (transaction) => saveRow('transactions', transactionSchema, transaction, 'transaction'),
}

const priceEntryRepository: PriceEntryRepository = {
  listPriceEntries: () => loadStore<PriceEntry>('priceEntries', 'price entries'),
  savePriceEntry: (entry) => saveRow('priceEntries', priceEntrySchema, entry, 'price entry'),
}

const notificationRepository: NotificationRepository = {
  listNotifications: () => loadStore<Notification>('notifications', 'notifications'),
  saveNotification: (notification) => saveRow('notifications', notificationSchema, notification, 'notification'),
}

const syncQueueRepository: SyncQueueRepository = {
  listSyncQueue: () => loadStore<SyncQueueItem>('syncQueue', 'sync queue'),
  async saveSyncQueueItem(item) {
    const parsed = syncQueueItemSchema.safeParse(item)
    if (!parsed.success) {
      return err({ code: 'VALIDATION', message: 'Invalid sync queue item.', details: parsed.error.flatten() })
    }
    try {
      await idbPutSyncItem(parsed.data)
      return ok(parsed.data)
    } catch (cause) {
      return err({ code: 'STORAGE', message: 'Could not save sync queue item.', details: cause })
    }
  },
}

const auditLogRepository: AuditLogRepository = {
  listAuditLogs: () => loadStore<AuditLogEntry>('auditLogs', 'audit logs'),
  saveAuditLog: (entry) => saveRow('auditLogs', auditLogSchema, entry, 'audit log'),
}

export const domainRepositories: DomainRepositories = {
  catalog: catalogRepository,
  users: userRepository,
  marketplace: marketplaceRepository,
  prices: priceEntryRepository,
  notifications: notificationRepository,
  syncQueue: syncQueueRepository,
  auditLogs: auditLogRepository,
}
