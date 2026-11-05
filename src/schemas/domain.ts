import { z } from 'zod'
import { ROLES } from '@/constants/roles'
import {
  APPROVAL_STATUSES,
  BID_STATUSES,
  CONSENT_STATUSES,
  FRESHNESS_STATUSES,
  LISTING_STATUSES,
  SYNC_QUEUE_STATUSES,
  TRANSACTION_STATUSES,
} from '@/types/domain/enums'

const isoDate = z.string().datetime({ offset: true })

export const userSchema = z.object({
  id: z.string().min(1),
  role: z.enum(ROLES),
  displayName: z.string().min(1),
  phonePlaceholder: z.string().min(1),
  farmerProfileId: z.string().min(1).optional(),
  createdAt: isoDate,
})

export const farmerProfileSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  displayNameBn: z.string().min(1),
  locationId: z.string().min(1),
  divisionId: z.string().min(1).optional(),
  districtId: z.string().min(1).optional(),
  upazilaId: z.string().min(1).optional(),
  unionId: z.string().min(1).optional(),
  hasPhone: z.boolean(),
  qrProfileId: z.string().min(1),
})

export const categorySchema = z.object({
  id: z.string().min(1),
  nameEn: z.string().min(1),
  nameBn: z.string().min(1),
})

export const unitSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  nameEn: z.string().min(1),
  nameBn: z.string().min(1),
  kgPerUnit: z.number().positive(),
})

export const productSchema = z.object({
  id: z.string().min(1),
  categoryId: z.string().min(1),
  nameEn: z.string().min(1),
  nameBn: z.string().min(1),
  allowedUnitIds: z.array(z.string().min(1)).min(1),
  imageUrl: z.string().min(1),
})

export const locationDataSourceSchema = z.enum([
  'jumman04',
  'bd_json',
  'demo_corridor',
  'demo_synthetic',
])

export const locationSchema = z.object({
  id: z.string().min(1),
  parentId: z.string().min(1).optional(),
  nameEn: z.string().min(1),
  nameBn: z.string().min(1),
  type: z.enum(['division', 'district', 'upazila', 'union']),
  dataSource: locationDataSourceSchema,
  officialId: z.string().min(1).optional(),
  bbsCode: z.string().min(1).optional(),
  demoCentroid: z.object({ lat: z.number(), lng: z.number() }).optional(),
  mapBoundaryId: z.string().min(1).optional(),
})

export const listingSchema = z.object({
  id: z.string().min(1),
  sellerUserId: z.string().min(1),
  productId: z.string().min(1),
  locationId: z.string().min(1),
  quantity: z.number().positive(),
  unitId: z.string().min(1),
  availableQuantity: z.number().nonnegative(),
  reservedQuantity: z.number().nonnegative(),
  completedQuantity: z.number().nonnegative(),
  askingPricePerUnit: z.number().positive(),
  status: z.enum(LISTING_STATUSES),
  demoLabel: z.literal('Demo'),
  createdAt: isoDate,
})

export const priceEntrySchema = z.object({
  id: z.string().min(1),
  farmerId: z.string().min(1),
  submittedByUserId: z.string().min(1),
  productId: z.string().min(1),
  locationId: z.string().min(1),
  reportedQuantity: z.number().positive(),
  reportedUnitId: z.string().min(1),
  reportedTotalPrice: z.number().positive(),
  normalizedQuantityKg: z.number().positive(),
  normalizedPricePerKg: z.number().positive(),
  consentStatus: z.enum(CONSENT_STATUSES),
  approvalStatus: z.enum(APPROVAL_STATUSES),
  freshnessStatus: z.enum(FRESHNESS_STATUSES),
  isAssisted: z.boolean(),
  anomalyFlagged: z.boolean(),
  submittedAt: isoDate,
  approvedAt: isoDate.optional(),
  rejectedAt: isoDate.optional(),
  rejectionReason: z.string().min(1).optional(),
  expiresAt: isoDate.optional(),
  demoLabel: z.literal('Demo'),
})

export const bidSchema = z.object({
  id: z.string().min(1),
  listingId: z.string().min(1),
  buyerUserId: z.string().min(1),
  quantity: z.number().positive(),
  unitId: z.string().min(1),
  offeredPricePerUnit: z.number().positive(),
  status: z.enum(BID_STATUSES),
  createdAt: isoDate,
  demoLabel: z.literal('Demo'),
})

export const transactionSchema = z.object({
  id: z.string().min(1),
  bidId: z.string().min(1),
  listingId: z.string().min(1),
  buyerUserId: z.string().min(1),
  sellerUserId: z.string().min(1),
  quantity: z.number().positive(),
  unitId: z.string().min(1),
  pricePerUnit: z.number().positive(),
  status: z.enum(TRANSACTION_STATUSES),
  buyerConfirmedAt: isoDate.optional(),
  sellerConfirmedAt: isoDate.optional(),
  createdAt: isoDate,
  demoLabel: z.literal('Demo'),
})

export const notificationSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  read: z.boolean(),
  createdAt: isoDate,
  demoLabel: z.literal('Demo'),
})

export const auditLogSchema = z.object({
  id: z.string().min(1),
  entityType: z.literal('priceEntry'),
  entityId: z.string().min(1),
  action: z.string().min(1),
  actorUserId: z.string().min(1),
  at: isoDate,
  note: z.string().optional(),
})

export const syncQueueItemSchema = z.object({
  clientEntryId: z.string().min(1),
  entityType: z.literal('priceEntry'),
  payload: z.record(z.string(), z.unknown()),
  status: z.enum(SYNC_QUEUE_STATUSES),
  errorDetail: z.string().optional(),
  updatedAt: isoDate,
})

export const demoSessionSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(ROLES),
  signedInAt: isoDate,
})

export const preferencesSchema = z.object({
  locale: z.enum(['en', 'bn']),
  favoriteListingIds: z.array(z.string()).optional(),
})
