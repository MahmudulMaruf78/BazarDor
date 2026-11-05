import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { dataLayer } from '@/data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  ADMIN_LOCATION_PAGE_SIZE,
  adminLocationPageCount,
  paginateAdminLocations,
} from '@/services/adminLocationBrowse'
import { categoryNameById, filterAdminProducts } from '@/services/adminCatalogBrowse'
import type { Category, Product } from '@/types/domain/records'

function truncateId(id: string, max = 32): string {
  if (id.length <= max) return id
  return `${id.slice(0, max - 1)}…`
}

export function AdminProductsBrowser() {
  const { t, pickName } = useI18n()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryId, setCategoryId] = useState<string | 'all'>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void Promise.all([
      dataLayer.repos.catalog.listProducts(),
      dataLayer.repos.catalog.listCategories(),
    ]).then(([prodRes, catRes]) => {
      if (cancelled) return
      if (prodRes.ok) setProducts(prodRes.data)
      if (catRes.ok) setCategories(catRes.data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const categoryById = useMemo(() => categoryNameById(categories), [categories])

  const filtered = useMemo(
    () => filterAdminProducts(products, { categoryId, search }),
    [products, categoryId, search],
  )

  const pageCount = adminLocationPageCount(filtered.length)
  const effectivePage = Math.min(page, Math.max(0, pageCount - 1))
  const pageRows = paginateAdminLocations(filtered, effectivePage)

  useEffect(() => {
    setPage(0)
  }, [categoryId, search])

  const rangeStart = filtered.length === 0 ? 0 : effectivePage * ADMIN_LOCATION_PAGE_SIZE + 1
  const rangeEnd = Math.min(filtered.length, (effectivePage + 1) * ADMIN_LOCATION_PAGE_SIZE)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('adminProductsTitle')}</CardTitle>
        <CardDescription>{t('adminProductsDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-bazardor-muted">{t('loading')}</p>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>{t('category')}</Label>
                <Select value={categoryId} onValueChange={(v) => setCategoryId(v as string | 'all')}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allCategories')}</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {pickName(cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="admin-product-search">{t('search')}</Label>
                <Input
                  id="admin-product-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('adminProductsSearchPlaceholder')}
                />
              </div>
            </div>

            <p className="text-xs text-bazardor-muted">
              {t('adminLocationsShowing')} {rangeStart}–{rangeEnd} {t('adminLocationsOf')} {filtered.length}{' '}
              ({t('adminLocationsFiltered')}, {t('adminLocationsTotal')} {products.length})
            </p>

            {filtered.length === 0 ? (
              <p className="text-sm text-bazardor-muted">{t('adminProductsEmpty')}</p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('adminLocationsColName')}</TableHead>
                      <TableHead>{t('category')}</TableHead>
                      <TableHead>{t('adminProductsColUnits')}</TableHead>
                      <TableHead>{t('adminProductsColImage')}</TableHead>
                      <TableHead>{t('adminLocationsColId')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.map((p) => {
                      const cat = categoryById.get(p.categoryId)
                      return (
                        <TableRow key={p.id}>
                          <TableCell>
                            <span className="mr-2">{pickName(p)}</span>
                          </TableCell>
                          <TableCell>{cat ? pickName(cat) : p.categoryId}</TableCell>
                          <TableCell className="font-mono text-xs">{p.allowedUnitIds.join(', ')}</TableCell>
                          <TableCell className="max-w-[12rem] truncate font-mono text-xs" title={p.imageUrl}>
                            {p.imageUrl}
                          </TableCell>
                          <TableCell className="font-mono text-xs" title={p.id}>
                            {truncateId(p.id)}
                          </TableCell>
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
