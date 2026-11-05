import type { RoleKey } from '@/constants/roles'
import type { User } from '@/types/domain/records'

export type AdminUserRoleFilter = RoleKey | 'all'

export type AdminUserBrowseCriteria = {
  role: AdminUserRoleFilter
  search: string
}

export function filterAdminUsers(users: readonly User[], criteria: AdminUserBrowseCriteria): User[] {
  const q = criteria.search.trim().toLowerCase()
  return users.filter((u) => {
    if (criteria.role !== 'all' && u.role !== criteria.role) return false
    if (!q) return true
    return (
      u.id.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q) ||
      u.phonePlaceholder.toLowerCase().includes(q)
    )
  })
}
