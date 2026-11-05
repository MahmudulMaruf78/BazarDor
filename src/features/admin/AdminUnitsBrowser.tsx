import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { dataLayer } from '@/data'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { filterAdminUnits } from '@/services/adminCatalogBrowse'
import type { Unit } from '@/types/domain/records'

function truncateId(id: string, max = 32): string {
  if (id.length <= max) return id
  return `${id.slice(0, max - 1)}…`
}

export function AdminUnitsBrowser() {
  const { t, pickName, formatNumber } = useI18n()
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void dataLayer.repos.catalog.listUnits().then((result) => {
      if (cancelled) return
      if (result.ok) setUnits(result.data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => filterAdminUnits(units, { search }), [units, search])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('adminUnitsTitle')}</CardTitle>
        <CardDescription>{t('adminUnitsDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-bazardor-muted">{t('loading')}</p>
        ) : (
          <>
            <div className="space-y-1 max-w-md">
              <Label htmlFor="admin-unit-search">{t('search')}</Label>
              <Input
                id="admin-unit-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('adminUnitsSearchPlaceholder')}
              />
            </div>

            <p className="text-xs text-bazardor-muted">
              {t('adminLocationsShowing')} {filtered.length} {t('adminLocationsOf')} {units.length}
            </p>

            {filtered.length === 0 ? (
              <p className="text-sm text-bazardor-muted">{t('adminUnitsEmpty')}</p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('adminLocationsColName')}</TableHead>
                      <TableHead>{t('adminUnitsColCode')}</TableHead>
                      <TableHead>{t('adminUnitsColKgPerUnit')}</TableHead>
                      <TableHead>{t('adminLocationsColId')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <span className="mr-2">{pickName(u)}</span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{u.code}</TableCell>
                        <TableCell>{formatNumber(u.kgPerUnit)}</TableCell>
                        <TableCell className="font-mono text-xs" title={u.id}>
                          {truncateId(u.id)}
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
