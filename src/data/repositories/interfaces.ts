import type { DemoSeedBundle } from '@/data/seed'
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
import type { RepositoryResult } from '@/types/result'

export interface CatalogRepository {
  listCategories(): Promise<RepositoryResult<Category[]>>
  listUnits(): Promise<RepositoryResult<Unit[]>>
  listLocations(): Promise<RepositoryResult<Location[]>>
  listProducts(): Promise<RepositoryResult<Product[]>>
}

export interface UserRepository {
  listUsers(): Promise<RepositoryResult<User[]>>
  listFarmerProfiles(): Promise<RepositoryResult<FarmerProfile[]>>
  getUserById(id: string): Promise<RepositoryResult<User>>
  saveUser(user: User): Promise<RepositoryResult<User>>
  saveFarmerProfile(profile: FarmerProfile): Promise<RepositoryResult<FarmerProfile>>
}

export interface MarketplaceRepository {
  listListings(): Promise<RepositoryResult<Listing[]>>
  getListingById(id: string): Promise<RepositoryResult<Listing>>
  saveListing(listing: Listing): Promise<RepositoryResult<Listing>>
  listBids(): Promise<RepositoryResult<Bid[]>>
  saveBid(bid: Bid): Promise<RepositoryResult<Bid>>
  listTransactions(): Promise<RepositoryResult<Transaction[]>>
  saveTransaction(transaction: Transaction): Promise<RepositoryResult<Transaction>>
}

export interface PriceEntryRepository {
  listPriceEntries(): Promise<RepositoryResult<PriceEntry[]>>
  savePriceEntry(entry: PriceEntry): Promise<RepositoryResult<PriceEntry>>
}

export interface NotificationRepository {
  listNotifications(): Promise<RepositoryResult<Notification[]>>
  saveNotification(notification: Notification): Promise<RepositoryResult<Notification>>
}

export interface SyncQueueRepository {
  listSyncQueue(): Promise<RepositoryResult<SyncQueueItem[]>>
  saveSyncQueueItem(item: SyncQueueItem): Promise<RepositoryResult<SyncQueueItem>>
}

export interface AuditLogRepository {
  listAuditLogs(): Promise<RepositoryResult<AuditLogEntry[]>>
  saveAuditLog(entry: AuditLogEntry): Promise<RepositoryResult<AuditLogEntry>>
}

export type DomainRepositories = {
  catalog: CatalogRepository
  users: UserRepository
  marketplace: MarketplaceRepository
  prices: PriceEntryRepository
  notifications: NotificationRepository
  syncQueue: SyncQueueRepository
  auditLogs: AuditLogRepository
}

export type SeedLoader = () => DemoSeedBundle
