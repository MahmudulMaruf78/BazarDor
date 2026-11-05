import { describe, expect, it } from 'vitest'
import { hasPermission } from '@/features/auth/permissions'
import { canRoleAccessPath, isProtectedDashboardPath } from '@/features/auth/routeAccess'

describe('Phase 4 route and permission guards', () => {
  it('maps dashboard paths to single demo roles', () => {
    expect(canRoleAccessPath('farmer', '/farmer')).toBe(true)
    expect(canRoleAccessPath('buyer', '/farmer')).toBe(false)
    expect(isProtectedDashboardPath('/admin')).toBe(true)
    expect(isProtectedDashboardPath('/')).toBe(false)
  })

  it('grants role-specific prototype permissions', () => {
    expect(hasPermission('fieldOfficer', 'price.approve')).toBe(true)
    expect(hasPermission('buyer', 'price.approve')).toBe(false)
    expect(hasPermission('admin', 'admin.demo.reset')).toBe(true)
    expect(hasPermission('admin', 'admin.locations.view')).toBe(true)
    expect(hasPermission('farmer', 'admin.locations.view')).toBe(false)
    expect(hasPermission('admin', 'admin.products.view')).toBe(true)
    expect(hasPermission('admin', 'admin.units.view')).toBe(true)
    expect(hasPermission('buyer', 'admin.products.view')).toBe(false)
  })
})
