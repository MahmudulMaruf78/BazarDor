import type { RoleKey } from '@/constants/roles'

/** Enforced by RequireRouteRole + RequireAuth (Phase 4). */
export const ROUTE_ROLE_ACCESS: Record<string, RoleKey[]> = {
  '/farmer': ['farmer'],
  '/buyer': ['buyer'],
  '/seller': ['seller'],
  '/field-officer': ['fieldOfficer'],
  '/department': ['department'],
  '/admin': ['admin'],
}
