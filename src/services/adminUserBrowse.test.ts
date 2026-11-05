import { describe, expect, it } from 'vitest'
import { filterAdminUsers } from '@/services/adminUserBrowse'
import type { User } from '@/types/domain/records'

const users: User[] = [
  {
    id: 'user-farmer-1',
    role: 'farmer',
    displayName: 'Demo Farmer',
    phonePlaceholder: '01XXXXXXXXX',
    createdAt: '2026-01-01T00:00:00+06:00',
  },
  {
    id: 'user-admin-1',
    role: 'admin',
    displayName: 'Demo Admin',
    phonePlaceholder: '01YYYYYYYYY',
    createdAt: '2026-01-01T00:00:00+06:00',
  },
]

describe('adminUserBrowse', () => {
  it('filters by role', () => {
    expect(filterAdminUsers(users, { role: 'admin', search: '' })).toHaveLength(1)
  })

  it('filters by search', () => {
    expect(filterAdminUsers(users, { role: 'all', search: 'farmer' })[0]?.id).toBe('user-farmer-1')
  })
})
