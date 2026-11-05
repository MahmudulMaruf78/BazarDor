import type { RoleKey } from '@/constants/roles'
import type { PermissionKey } from '@/constants/permissions'

/** Prototype permission map — UI guards only, not real security. */
export const ROLE_PERMISSIONS: Record<RoleKey, readonly PermissionKey[]> = {
  farmer: [
    'dashboard.view.own',
    'marketplace.browse',
    'marketplace.listing.create',
    'price.entry.self',
    'notifications.view',
  ],
  buyer: [
    'dashboard.view.own',
    'marketplace.browse',
    'marketplace.bid.create',
    'notifications.view',
  ],
  seller: [
    'dashboard.view.own',
    'marketplace.browse',
    'marketplace.listing.create',
    'notifications.view',
  ],
  fieldOfficer: [
    'dashboard.view.own',
    'marketplace.browse',
    'price.entry.assisted',
    'price.approve',
    'notifications.view',
  ],
  department: ['dashboard.view.own', 'analytics.view', 'notifications.view'],
  admin: [
    'dashboard.view.own',
    'marketplace.browse',
    'analytics.view',
    'admin.demo.reset',
    'notifications.view',
  ],
}

export function hasPermission(role: RoleKey, permission: PermissionKey): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function listPermissionsForRole(role: RoleKey): readonly PermissionKey[] {
  return ROLE_PERMISSIONS[role]
}
