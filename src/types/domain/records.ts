import type { RoleKey } from '@/constants/roles'
import type {
  ApprovalStatus,
  BidStatus,
  ConsentStatus,
  FreshnessStatus,
  ListingStatus,
  SyncQueueStatus,
  TransactionStatus,
} from './enums'

export type User = {
  id: string
  role: RoleKey
  displayName: string
  /** Demo placeholder only — never a real phone number. */
  phonePlaceholder: string
  farmerProfileId?: string
  createdAt: string
}

export type FarmerProfile = {
  id: string
  userId: string
  displayNameBn: string
  locationId: string
  divisionId?: string
  districtId?: string
  upazilaId?: string
  unionId?: string
  hasPhone: boolean
  /** Non-sensitive identifier for QR demo — not PII. */
  qrProfileId: string
}

export type Category = {
  id: string
  nameEn: string
  nameBn: string
}

export type Unit = {
  id: string
  code: string
  nameEn: string
  nameBn: string
  kgPerUnit: number
}

export type Product = {
  id: string
  categoryId: string
  nameEn: string
  nameBn: string
  allowedUnitIds: string[]
  /** Demo/sample artwork path under public/ — not a live catalog photo feed. */
  imageUrl: string
}

export type LocationDataSource = 'jumman04' | 'bd_json' | 'demo_corridor' | 'demo_synthetic'

export type Location = {
  id: string
  parentId?: string
  nameEn: string
  nameBn: string
  type: 'division' | 'district' | 'upazila' | 'union'
  dataSource: LocationDataSource
  /** Reserved for OD-10 authoritative dataset — not populated in prototype. */
  officialId?: string
  /** Reserved BBS code — not populated until official file supplied. */
  bbsCode?: string
  /** Demo map centroid — not survey-grade GeoJSON. */
  demoCentroid?: { lat: number; lng: number }
  /** Future map layer reference — no boundary GeoJSON in repo yet. */
  mapBoundaryId?: string
}

export type Listing = {
  id: string
  sellerUserId: string
  productId: string
  locationId: string
  quantity: number
  unitId: string
  availableQuantity: number
  reservedQuantity: number
  completedQuantity: number
  askingPricePerUnit: number
  status: ListingStatus
  demoLabel: 'Demo'
  createdAt: string
}

export type PriceEntry = {
  id: string
  farmerId: string
  submittedByUserId: string
  productId: string
  locationId: string
  reportedQuantity: number
  reportedUnitId: string
  reportedTotalPrice: number
  normalizedQuantityKg: number
  normalizedPricePerKg: number
  consentStatus: ConsentStatus
  approvalStatus: ApprovalStatus
  freshnessStatus: FreshnessStatus
  isAssisted: boolean
  anomalyFlagged: boolean
  submittedAt: string
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string
  expiresAt?: string
  demoLabel: 'Demo'
}

export type Bid = {
  id: string
  listingId: string
  buyerUserId: string
  quantity: number
  unitId: string
  offeredPricePerUnit: number
  status: BidStatus
  createdAt: string
  demoLabel: 'Demo'
}

export type Transaction = {
  id: string
  bidId: string
  listingId: string
  buyerUserId: string
  sellerUserId: string
  quantity: number
  unitId: string
  pricePerUnit: number
  status: TransactionStatus
  buyerConfirmedAt?: string
  sellerConfirmedAt?: string
  createdAt: string
  demoLabel: 'Demo'
}

export type Notification = {
  id: string
  userId: string
  title: string
  body: string
  read: boolean
  createdAt: string
  demoLabel: 'Demo'
}

export type SyncQueueItem = {
  clientEntryId: string
  entityType: 'priceEntry'
  payload: Record<string, unknown>
  status: SyncQueueStatus
  errorDetail?: string
  updatedAt: string
}

export type AuditLogEntry = {
  id: string
  entityType: 'priceEntry'
  entityId: string
  action: string
  actorUserId: string
  at: string
  note?: string
}
