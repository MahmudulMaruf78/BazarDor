import { useI18n } from '@/app/preferences/LocaleProvider'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { snapshotsForListings } from '@/services/productCardMarketSnapshot'
import { listFavoriteListingIds, toggleFavoriteListing } from '@/features/marketplace/favoritesService'
import { dataLayer } from '@/data'
import type { Category, Listing, Location, PriceEntry, Product, Unit } from '@/types/domain/records'
import { browseListings, type ListingFilters } from '@/features/marketplace/marketplaceService'
import { ListingProductCard } from '@/features/marketplace/ListingProductCard'
import { ProductCardMarketStats } from '@/features/marketplace/ProductCardMarketStats'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'
import { deepestScopeLocationId, type BangladeshLocationSelection } from '@/data/bangladeshLocationIndex'
import { ListingCatalogFilterBar } from '@/features/marketplace/ListingCatalogFilterBar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type ListingsBrowsePanelProps = {
  userId: string
  canBid?: boolean
  canFavorite?: boolean
  onBid?: (listing: Listing) => void
  favoriteIds?: string[]
  onFavoritesChange?: (ids: string[]) => void
}

export function ListingsBrowsePanel({
  userId,
  canBid,
  canFavorite,
  onBid,
  favoriteIds,
  onFavoritesChange,
}: ListingsBrowsePanelProps) {
  const { t, pickName, formatNumber, translateError, locale } = useI18n()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [priceEntries, setPriceEntries] = useState<PriceEntry[]>([])
  const [filters, setFilters] = useState<ListingFilters>({
    page: 1,
    pageSize: 6,
    sort: 'newest',
    locationScopeId: D.divisionKhulna,
  })
  const [locationSel, setLocationSel] = useState<BangladeshLocationSelection>({
    divisionId: D.divisionKhulna,
  })
  const [pageData, setPageData] = useState<import('@/features/marketplace/marketplaceService').ListingPage>()

  useEffect(() => {
    void Promise.all([
      dataLayer.repos.catalog.listProducts(),
      dataLayer.repos.catalog.listCategories(),
      dataLayer.repos.catalog.listLocations(),
      dataLayer.repos.catalog.listUnits(),
      dataLayer.repos.prices.listPriceEntries(),
    ]).then(([p, c, l, u, pe]) => {
      if (p.ok) setProducts(p.data)
      if (c.ok) setCategories(c.data)
      if (l.ok) setLocations(l.data)
      if (u.ok) setUnits(u.data)
      if (pe.ok) setPriceEntries(pe.data)
    })
  }, [])

  useEffect(() => {
    void browseListings(filters).then((result) => {
      if (!result.ok) {
        toast.error(translateError(result.error.message))
        return
      }
      setPageData(result.data)
    })
  }, [filters, translateError])

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])
  const unitMap = useMemo(() => new Map(units.map((u) => [u.id, u])), [units])

  const listingSnapshots = useMemo(() => {
    if (!pageData?.items.length || locations.length === 0 || units.length === 0) {
      return new Map<string, import('@/services/productCardMarketSnapshot').ProductCardMarketSnapshot>()
    }
    return snapshotsForListings(pageData.items, priceEntries, locations, units)
  }, [pageData?.items, priceEntries, locations, units])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('marketplaceCatalog')}</CardTitle>
        <CardDescription>{t('marketplaceCatalogDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="search">{t('search')}</Label>
            <Input
              id="search"
              value={filters.search ?? ''}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value, page: 1 }))}
              placeholder={t('productOrLocation')}
            />
          </div>
          <div className="space-y-1">
            <Label>{t('sort')}</Label>
            <Select
              value={filters.sort ?? 'newest'}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, sort: value as ListingFilters['sort'], page: 1 }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('sortNewest')}</SelectItem>
                <SelectItem value="price-asc">{t('sortPriceAsc')}</SelectItem>
                <SelectItem value="price-desc">{t('sortPriceDesc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ListingCatalogFilterBar
          categories={categories}
          categoryId={filters.categoryId}
          onCategoryChange={(categoryId) => setFilters((prev) => ({ ...prev, categoryId, page: 1 }))}
          locationSel={locationSel}
          onLocationChange={(sel) => {
            setLocationSel(sel)
            setFilters((prev) => ({
              ...prev,
              locationScopeId: sel.divisionId ? deepestScopeLocationId(sel) : undefined,
              page: 1,
            }))
          }}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(pageData?.items ?? []).map((listing) => {
            const product = productMap.get(listing.productId)
            const unit = unitMap.get(listing.unitId)
            const snap = listingSnapshots.get(listing.id)
            const locationChain =
              snap && locale === 'bn' ? snap.locationChainBn : snap?.locationChainEn
            const isFavorite = favoriteIds?.includes(listing.id)
            const productTitle = product ? pickName(product) : listing.productId
            return (
              <ListingProductCard
                key={listing.id}
                className="flex flex-col"
                title={productTitle}
                imageUrl={product?.imageUrl}
                imageAlt={productTitle}
                contentClassName="flex flex-1 flex-col gap-3 text-sm"
              >
                {snap && locationChain ? (
                  <ProductCardMarketStats
                    locationChain={locationChain}
                    askingPricePerUnit={snap.askingPricePerUnit}
                    unitCode={snap.unitCode}
                    officialAverage={snap.officialAverage}
                  />
                ) : null}
                  <p>
                    <span className="text-bazardor-muted">{t('available')}: </span>
                    {formatNumber(listing.availableQuantity, 0)} {unit?.code ?? listing.unitId}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-1">
                    <Link
                      to={`/product/${listing.productId}`}
                      className={buttonVariants({ size: 'sm', variant: 'secondary' })}
                    >
                      {t('productDetailSellersTitle')}
                    </Link>
                    <Link
                      to={`/listing/${listing.id}`}
                      className={buttonVariants({ size: 'sm', variant: 'outline' })}
                    >
                      {t('viewListingDetails')}
                    </Link>
                    {canFavorite ? (
                      <Button
                        type="button"
                        size="sm"
                        variant={isFavorite ? 'default' : 'outline'}
                        onClick={() => {
                          void toggleFavoriteListing(listing.id).then((result) => {
                            if (!result.ok) {
                              toast.error(translateError(result.error.message))
                              return
                            }
                            onFavoritesChange?.(result.data)
                          })
                        }}
                      >
                        {isFavorite ? t('favourited') : t('favorite')}
                      </Button>
                    ) : null}
                    {canBid && onBid ? (
                      <Button type="button" size="sm" onClick={() => onBid(listing)}>
                        {t('offer')}
                      </Button>
                    ) : null}
                  </div>
              </ListingProductCard>
            )
          })}
        </div>
        {(pageData?.items.length ?? 0) === 0 ? (
          <p className="text-sm text-bazardor-muted">{t('noListings')}</p>
        ) : null}

        <div className="flex items-center justify-between text-sm">
          <span className="text-bazardor-muted">
            {t('page')} {pageData?.page ?? 1} · {formatNumber(pageData?.total ?? 0, 0)} {t('listingsWord')}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={(filters.page ?? 1) <= 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page ?? 1) - 1) }))}
            >
              {t('previous')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={
                !pageData || pageData.page * pageData.pageSize >= pageData.total
              }
              onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
            >
              {t('next')}
            </Button>
          </div>
        </div>
        <p className="text-xs text-bazardor-muted">Viewer: {userId}</p>
      </CardContent>
    </Card>
  )
}

export function useFavoriteListingIds() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  useEffect(() => {
    void listFavoriteListingIds().then((result) => {
      if (result.ok) setFavoriteIds(result.data)
    })
  }, [])
  return { favoriteIds, setFavoriteIds }
}
