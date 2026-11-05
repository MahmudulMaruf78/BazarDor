export const IDB_STORES = {
  meta: 'meta',
  users: 'users',
  farmerProfiles: 'farmerProfiles',
  categories: 'categories',
  units: 'units',
  locations: 'locations',
  products: 'products',
  productVariants: 'productVariants',
  listings: 'listings',
  priceEntries: 'priceEntries',
  bids: 'bids',
  transactions: 'transactions',
  notifications: 'notifications',
  syncQueue: 'syncQueue',
  auditLogs: 'auditLogs',
} as const

export type IdbStoreName = (typeof IDB_STORES)[keyof typeof IDB_STORES]
