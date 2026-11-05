export const BID_STATUSES = ['pending', 'accepted', 'rejected'] as const
export type BidStatus = (typeof BID_STATUSES)[number]

export const TRANSACTION_STATUSES = [
  'awaiting_completion_confirmation',
  'completed',
  'cancelled',
] as const
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number]

export const APPROVAL_STATUSES = ['pending', 'approved', 'rejected'] as const
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number]

export const CONSENT_STATUSES = ['not_required', 'pending', 'verified', 'unavailable'] as const
export type ConsentStatus = (typeof CONSENT_STATUSES)[number]

export const FRESHNESS_STATUSES = ['active', 'expired'] as const
export type FreshnessStatus = (typeof FRESHNESS_STATUSES)[number]

export const SYNC_QUEUE_STATUSES = [
  'DRAFT',
  'PENDING_SYNC',
  'SYNCING',
  'SYNCED',
  'FAILED',
  'CONFLICT',
] as const
export type SyncQueueStatus = (typeof SYNC_QUEUE_STATUSES)[number]

export const LISTING_STATUSES = ['active', 'sold_out', 'inactive'] as const
export type ListingStatus = (typeof LISTING_STATUSES)[number]
