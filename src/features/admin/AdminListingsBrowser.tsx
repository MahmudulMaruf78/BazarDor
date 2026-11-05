import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAppSelector } from '@/app/store/hooks'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { selectAuthSession } from '@/features/auth/authSlice'
import { Can } from '@/features/auth/Can'
import { dataLayer } from '@/data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { MessageKey } from '@/lib/i18n/messages'
import { LISTING_STATUSES, type ListingStatus } from '@/types/domain/enums'
import {
  ADMIN_LOCATION_PAGE_SIZE,
  adminLocationPageCount,
  paginateAdminLocations,
} from '@/services/adminLocationBrowse'
import { filterAdminListings, type AdminListingStatusFilter } from '@/services/adminListingBrowse'
import { moderateListing } from '@/services/adminListingModeration'
import type { Listing, Location, Product, User } from '@/types/domain/records'

const LISTING_STATUS_LABEL: Record<ListingStatus, MessageKey> = {
  active: 'listingStatus_active',
  sold_out: 'listingStatus_sold_out',
  inactive: 'listingStatus_inactive',
}

function truncateId(id: string, max = 28): string {
  if (id.length <= max) return id
  return `${id.slice(0, max - 1)}…`
}

export function AdminListingsBrowser() {
  const { t, pickName, formatNumber } = useI18n()
  const session = useAppSelector(selectAuthSession)
  const [listings, setListings] = useState<Listing[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<AdminListingStatusFilter>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [moderatingId, setModeratingId] = useState<string | null>(null)

  const reloadListings = useCallback(() => {
    void dataLayer.repos.marketplace.listListings().then((listRes) => {
      if (listRes.ok) setListings(listRes.data)
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void Promise.all([
      dataLayer.repos.marketplace.listListings(),
      dataLayer.repos.catalog.listProducts(),
      dataLayer.repos.catalog.listLocations(),
      dataLayer.repos.users.listUsers(),
    ]).then(([listRes, prodRes, locRes, userRes]) => {
      if (cancelled) return
      if (listRes.ok) setListings(listRes.data)
      if (prodRes.ok) setProducts(prodRes.data)
      if (locRes.ok) setLocations(locRes.data)
      if (userRes.ok) setUsers(userRes.data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])
  const locationById = useMemo(() => new Map(locations.map((l) => [l.id, l])), [locations])
  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])

  const filtered = useMemo(
    () => filterAdminListings(listings, { status: statusFilter, search }),
    [listings, statusFilter, search],
  )

  const pageCount = adminLocationPageCount(filtered.length)
  const effectivePage = Math.min(page, Math.max(0, pageCount - 1))
  const pageRows = paginateAdminLocations(filtered, effectivePage)

  useEffect(() => {
    setPage(0)
  }, [statusFilter, search])

  const rangeStart = filtered.length === 0 ? 0 : effectivePage * ADMIN_LOCATION_PAGE_SIZE + 1
  const rangeEnd = Math.min(filtered.length, (effectivePage + 1) * ADMIN_LOCATION_PAGE_SIZE)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('adminListingsTitle')}</CardTitle>
        <CardDescription>{t('adminListingsDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-bazardor-muted">{t('loading')}</p>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>{t('status')}</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as AdminListingStatusFilter)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all')}</SelectItem>
                    {LISTING_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {t(LISTING_STATUS_LABEL[status])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="admin-listing-search">{t('search')}</Label>
                <Input
                  id="admin-listing-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('adminListingsSearchPlaceholder')}
                />
              </div>
            </div>

            <p className="text-xs text-bazardor-muted">
              {t('adminLocationsShowing')} {rangeStart}–{rangeEnd} {t('adminLocationsOf')} {filtered.length}{' '}
              ({t('adminLocationsFiltered')}, {t('adminLocationsTotal')} {listings.length})
            </p>

            {filtered.length === 0 ? (
              <p className="text-sm text-bazardor-muted">{t('adminListingsEmpty')}</p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('product')}</TableHead>
                      <TableHead>{t('adminListingsColSeller')}</TableHead>
                      <TableHead>{t('location')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('adminListingsColStock')}</TableHead>
                      <TableHead>{t('adminListingsColPrice')}</TableHead>
                      <TableHead>{t('adminLocationsColId')}</TableHead>
                      <Can permission="admin.listings.moderate">
                        <TableHead>{t('adminListingsColActions')}</TableHead>
                      </Can>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.map((listing) => {
                      const product = productById.get(listing.productId)
                      const location = locationById.get(listing.locationId)
                      const seller = userById.get(listing.sellerUserId)
                      return (
                        <TableRow key={listing.id}>
                          <TableCell>
                            {product ? pickName(product) : listing.productId}
                            <Badge className="ml-2" variant="secondary">
                              {t('demoLabel')}
                            </Badge>
                          </TableCell>
                          <TableCell>{seller?.displayName ?? listing.sellerUserId}</TableCell>
                          <TableCell>{location ? pickName(location) : listing.locationId}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{t(LISTING_STATUS_LABEL[listing.status])}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {formatNumber(listing.availableQuantity)} / {formatNumber(listing.reservedQuantity)}{' '}
                            {t('adminListingsReservedHint')}
                          </TableCell>
                          <TableCell>{formatNumber(listing.askingPricePerUnit)}</TableCell>
                          <TableCell className="font-mono text-xs" title={listing.id}>
                            {truncateId(listing.id)}
                          </TableCell>
                          <Can permission="admin.listings.moderate">
                            <TableCell>
                              {listing.status === 'active' ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={
                                    moderatingId === listing.id || listing.reservedQuantity > 0
                                  }
                                  title={
                                    listing.reservedQuantity > 0 ? t('adminListingsRejectBlocked') : undefined
                                  }
                                  onClick={() => {
                                    if (!session?.userId) return
                                    setModeratingId(listing.id)
                                    void moderateListing({
                                      listingId: listing.id,
                                      decision: 'reject',
                                      actorUserId: session.userId,
                                    })
                                      .then((result) => {
                                        if (!result.ok) {
                                          toast.error(result.error.message)
                                          return
                                        }
                                        toast.success(t('adminListingsRejectedToast'))
                                        reloadListings()
                                      })
                                      .finally(() => setModeratingId(null))
                                  }}
                                >
                                  {t('rejectLabel')}
                                </Button>
                              ) : null}
                              {listing.status === 'inactive' ? (
                                <Button
                                  type="button"
                                  variant="default"
                                  size="sm"
                                  disabled={moderatingId === listing.id}
                                  onClick={() => {
                                    if (!session?.userId) return
                                    setModeratingId(listing.id)
                                    void moderateListing({
                                      listingId: listing.id,
                                      decision: 'approve',
                                      actorUserId: session.userId,
                                    })
                                      .then((result) => {
                                        if (!result.ok) {
                                          toast.error(result.error.message)
                                          return
                                        }
                                        toast.success(t('adminListingsApprovedToast'))
                                        reloadListings()
                                      })
                                      .finally(() => setModeratingId(null))
                                  }}
                                >
                                  {t('approve')}
                                </Button>
                              ) : null}
                            </TableCell>
                          </Can>
                        </TableRow>
                      )
                    })}
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
