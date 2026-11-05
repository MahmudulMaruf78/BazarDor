import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { dataLayer } from '@/data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { MessageKey } from '@/lib/i18n/messages'
import {
  ADMIN_LOCATION_PAGE_SIZE,
  adminLocationPageCount,
  countByDataSource,
  filterAdminLocations,
  LOCATION_DATA_SOURCES,
  paginateAdminLocations,
  type AdminLocationTypeFilter,
} from '@/services/adminLocationBrowse'
import type { Location, LocationDataSource } from '@/types/domain/records'

const DATA_SOURCE_LABEL: Record<LocationDataSource, MessageKey> = {
  jumman04: 'locationDataSource_jumman04',
  bd_json: 'locationDataSource_bd_json',
  demo_corridor: 'locationDataSource_demo_corridor',
  demo_synthetic: 'locationDataSource_demo_synthetic',
}

function dataSourceBadgeVariant(
  source: LocationDataSource,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (source === 'demo_synthetic') return 'destructive'
  if (source === 'jumman04') return 'secondary'
  if (source === 'demo_corridor') return 'outline'
  return 'default'
}

function truncateId(id: string, max = 36): string {
  if (id.length <= max) return id
  return `${id.slice(0, max - 1)}…`
}

export function AdminLocationsBrowser() {
  const { t, pickName } = useI18n()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [sources, setSources] = useState<LocationDataSource[]>(() => [...LOCATION_DATA_SOURCES])
  const [typeFilter, setTypeFilter] = useState<AdminLocationTypeFilter>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void dataLayer.repos.catalog.listLocations().then((result) => {
      if (cancelled) return
      if (result.ok) setLocations(result.data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const sourceCounts = useMemo(() => countByDataSource(locations), [locations])

  const filtered = useMemo(
    () =>
      filterAdminLocations(locations, {
        dataSources: sources,
        type: typeFilter,
        search,
      }),
    [locations, sources, typeFilter, search],
  )

  const pageCount = adminLocationPageCount(filtered.length)
  const effectivePage = Math.min(page, Math.max(0, pageCount - 1))
  const pageRows = paginateAdminLocations(filtered, effectivePage)

  useEffect(() => {
    setPage(0)
  }, [sources, typeFilter, search])

  const toggleSource = (source: LocationDataSource) => {
    setSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source],
    )
  }

  const rangeStart = filtered.length === 0 ? 0 : effectivePage * ADMIN_LOCATION_PAGE_SIZE + 1
  const rangeEnd = Math.min(filtered.length, (effectivePage + 1) * ADMIN_LOCATION_PAGE_SIZE)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('adminLocationsTitle')}</CardTitle>
        <CardDescription>
          {t('adminLocationsDesc')}{' '}
          <code className="rounded bg-muted px-1 text-xs">{t('adminLocationsSourceDoc')}</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-bazardor-muted">{t('loading')}</p>
        ) : (
          <>
            <div className="space-y-2">
              <Label>{t('adminLocationsFilterSource')}</Label>
              <div className="flex flex-wrap gap-2">
                {LOCATION_DATA_SOURCES.map((source) => {
                  const active = sources.includes(source)
                  return (
                    <Button
                      key={source}
                      type="button"
                      size="sm"
                      variant={active ? 'default' : 'outline'}
                      onClick={() => toggleSource(source)}
                    >
                      {t(DATA_SOURCE_LABEL[source])} ({sourceCounts[source]})
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>{t('adminLocationsFilterType')}</Label>
                <Select
                  value={typeFilter}
                  onValueChange={(v) => setTypeFilter(v as AdminLocationTypeFilter)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all')}</SelectItem>
                    <SelectItem value="division">{t('locationDivision')}</SelectItem>
                    <SelectItem value="district">{t('locationDistrict')}</SelectItem>
                    <SelectItem value="upazila">{t('locationUpazila')}</SelectItem>
                    <SelectItem value="union">{t('locationUnion')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="admin-loc-search">{t('search')}</Label>
                <Input
                  id="admin-loc-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('adminLocationsSearchPlaceholder')}
                />
              </div>
            </div>

            <p className="text-xs text-bazardor-muted">
              {t('adminLocationsShowing')} {rangeStart}–{rangeEnd} {t('adminLocationsOf')} {filtered.length}{' '}
              ({t('adminLocationsFiltered')}, {t('adminLocationsTotal')} {locations.length})
            </p>

            {filtered.length === 0 ? (
              <p className="text-sm text-bazardor-muted">{t('adminLocationsEmpty')}</p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('adminLocationsColName')}</TableHead>
                      <TableHead>{t('adminLocationsColType')}</TableHead>
                      <TableHead>{t('adminLocationsColSource')}</TableHead>
                      <TableHead>{t('adminLocationsColParent')}</TableHead>
                      <TableHead>{t('adminLocationsColId')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.map((loc) => (
                      <TableRow key={loc.id}>
                        <TableCell>{pickName(loc)}</TableCell>
                        <TableCell>{loc.type}</TableCell>
                        <TableCell>
                          <Badge variant={dataSourceBadgeVariant(loc.dataSource)}>
                            {t(DATA_SOURCE_LABEL[loc.dataSource])}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {loc.parentId ?? '—'}
                        </TableCell>
                        <TableCell className="font-mono text-xs" title={loc.id}>
                          {truncateId(loc.id)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {filtered.length > ADMIN_LOCATION_PAGE_SIZE ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={effectivePage <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  {t('adminLocationsPrev')}
                </Button>
                <span className="text-sm text-bazardor-muted">
                  {t('adminLocationsPage')} {effectivePage + 1} / {pageCount}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={effectivePage >= pageCount - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t('adminLocationsNext')}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}
