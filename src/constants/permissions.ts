export const PERMISSIONS = [
  'dashboard.view.own',
  'marketplace.browse',
  'marketplace.listing.create',
  'marketplace.bid.create',
  'price.entry.self',
  'price.entry.assisted',
  'price.approve',
  'analytics.view',
  'admin.demo.reset',
  'notifications.view',
] as const

export type PermissionKey = (typeof PERMISSIONS)[number]
