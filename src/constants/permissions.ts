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
  'admin.locations.view',
  'admin.products.view',
  'admin.units.view',
  'admin.users.view',
  'admin.listings.view',
  'admin.listings.moderate',
  'notifications.view',
] as const

export type PermissionKey = (typeof PERMISSIONS)[number]
