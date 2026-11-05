import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { ROLES, ROLE_DASHBOARD_PATH } from '@/constants/roles'
import { dataLayer } from '@/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { filterAdminUsers, type AdminUserRoleFilter } from '@/services/adminUserBrowse'
import type { User } from '@/types/domain/records'

function truncateId(id: string, max = 28): string {
  if (id.length <= max) return id
  return `${id.slice(0, max - 1)}…`
}

export function AdminUsersBrowser() {
  const { t, roleLabel } = useI18n()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState<AdminUserRoleFilter>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void dataLayer.repos.users.listUsers().then((result) => {
      if (cancelled) return
      if (result.ok) setUsers(result.data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(
    () => filterAdminUsers(users, { role: roleFilter, search }),
    [users, roleFilter, search],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('adminUsersTitle')}</CardTitle>
        <CardDescription>{t('adminUsersDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>{t('role')}</Label>
                <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as AdminUserRoleFilter)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all')}</SelectItem>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {roleLabel(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="admin-user-search">{t('search')}</Label>
                <Input
                  id="admin-user-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('adminUsersSearchPlaceholder')}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {t('adminLocationsShowing')} {filtered.length} {t('adminLocationsOf')} {users.length}
            </p>

            {filtered.length === 0 ? (
              <EmptyState title={t('adminUsersEmpty')} />
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('displayName')}</TableHead>
                      <TableHead>{t('role')}</TableHead>
                      <TableHead>{t('adminUsersColPhone')}</TableHead>
                      <TableHead>{t('adminUsersColProfile')}</TableHead>
                      <TableHead>{t('dashboard')}</TableHead>
                      <TableHead>{t('adminLocationsColId')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.displayName}</TableCell>
                        <TableCell>{roleLabel(user.role)}</TableCell>
                        <TableCell className="font-mono text-xs">{user.phonePlaceholder}</TableCell>
                        <TableCell className="font-mono text-xs">{user.farmerProfileId ?? '—'}</TableCell>
                        <TableCell>
                          <Link className="text-sm underline" to={ROLE_DASHBOARD_PATH[user.role]}>
                            {ROLE_DASHBOARD_PATH[user.role]}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono text-xs" title={user.id}>
                          {truncateId(user.id)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
