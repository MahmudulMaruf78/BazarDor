import type { RoleKey } from '@/constants/roles'
import { ROUTE_ROLE_ACCESS } from '@/app/router/route-permissions'

export function rolesAllowedForPath(pathname: string): RoleKey[] | undefined {
  return ROUTE_ROLE_ACCESS[pathname]
}

export function canRoleAccessPath(role: RoleKey, pathname: string): boolean {
  const allowed = rolesAllowedForPath(pathname)
  if (!allowed) return true
  return allowed.includes(role)
}

export function isProtectedDashboardPath(pathname: string): boolean {
  return pathname in ROUTE_ROLE_ACCESS
}
