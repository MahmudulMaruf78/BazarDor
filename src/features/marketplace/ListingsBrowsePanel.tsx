import { useI18n } from '@/app/preferences/LocaleProvider'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { listFavoriteListingIds, toggleFavoriteListing } from '@/features/marketplace/favoritesService'
import { dataLayer } from '@/data'
import { productDetailHref, type ProductBrowsePage } from '@/services/productCatalogBrowse'
import {
  formatBrowseCardTitle,
  formatVariantSummary,
  isDefaultStandardVariant,
} from '@/services/productVariantCatalog'
import type { Category, Product, ProductVariant, Unit } from '@/types/domain/records'
import { browseProductCatalog, type ListingFilters } from '@/features/marketplace/marketplaceService'
import { ListingProductCard } from '@/features/marketplace/ListingProductCard'
import { ProductCardMarketStats } from '@/features/marketplace/ProductCardMarketStats'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'
import { deepestScopeLocationId, type BangladeshLocationSelection } from '@/data/bangladeshLocationIndex'
import { ListingCatalogFilterBar } from '@/features/marketplace/ListingCatalogFilterBar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type ListingsBrowsePanelProps = {
  userId: string
  canFavorite?: boolean
  favoriteIds?: string[]
  onFavoritesChange?: (ids: string[]) => void
}

export function ListingsBrowsePanel({
  userId,
  canFavorite,
  favoriteIds,
  onFavoritesChange,
}: ListingsBrowsePanelProps) {
  const { t, pickName, formatNumber, translateError, locale, formatUnitLabel } = useI18n()
  const [categories, setCategories] = useState<Category[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [filters, setFilters] = useState<ListingFilters>({
    page: 1,
    pageSize: 6,
    sort: 'newest',
    locationScopeId: D.divisionKhulna,
  })
  const [locationSel, setLocationSel] = useState<BangladeshLocationSelection>({
    divisionId: D.divisionKhulna,
  })
  const [pageData, setPageData] = useState<ProductBrowsePage>()

  useEffect(() => {
    void Promise.all([
      dataLayer.repos.catalog.listCategories(),
      dataLayer.repos.catalog.listUnits(),
      dataLayer.repos.catalog.listProducts(),
      dataLayer.repos.catalog.listProductVariants(),
    ]).then(([c, u, p, v]) => {
      if (c.ok) setCategories(c.data)
      if (u.ok) setUnits(u.data)
      if (p.ok) setProducts(p.data)
      if (v.ok) setVariants(v.data)
    })
  }, [])

  useEffect(() => {
    void browseProductCatalog(filters).then((result) => {
      if (!result.ok) {
        toast.error(translateError(result.error.message))
        return
      }
      setPageData(result.data)
    })
  }, [filters, translateError])

  const unitMap = useMemo(() => new Map(units.map((u) => [u.id, u])), [units])

  const variantFilterOptions = useMemo(() => {
    if (!filters.categoryId) return variants
    const productIds = new Set(
      products.filter((p) => p.categoryId === filters.categoryId).map((p) => p.id),
    )
    return variants.filter((v) => productIds.has(v.productId))
  }, [variants, products, filters.categoryId])

  const formatSellerMeta = (sellerCount: number, listingCount: number) => {
    const sellers = t('productCardSellerCount').replace('{count}', formatNumber(sellerCount, 0))
    const listings = t('productCardListingCount').replace('{count}', formatNumber(listingCount, 0))
    return `${sellers} · ${listings}`
  }

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader>
        <CardTitle>{t('marketplaceCatalog')}</CardTitle>
        <CardDescription>{t('marketplaceCatalogDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border/80 bg-muted/10 p-4 space-y-4">
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
          onCategoryChange={(categoryId) => setFilters((prev) => ({ ...prev, categoryId, variantId: undefined, page: 1 }))}
          locationSel={locationSel}
          onLocationChange={(sel) => {
            setLocationSel(sel)
            setFilters((prev) => ({
              ...prev,
              locationScopeId: sel.divisionId ? deepestScopeLocationId(sel) : undefined,
              page: 1,
            }))
          }}
          variants={variantFilterOptions}
          variantId={filters.variantId}
          onVariantChange={(variantId) => setFilters((prev) => ({ ...prev, variantId, page: 1 }))}
          onReset={() => {
            setLocationSel({ divisionId: D.divisionKhulna })
            setFilters((prev) => ({
              ...prev,
              categoryId: undefined,
              variantId: undefined,
              locationScopeId: D.divisionKhulna,
              page: 1,
            }))
          }}
        />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(pageData?.items ?? []).map((card) => {
            const listing = card.showcaseListing
            const snap = card.snapshot
            const unit = unitMap.get(listing.unitId)
            const locationChain = locale === 'bn' ? snap.locationChainBn : snap.locationChainEn
            const isFavorite = favoriteIds?.includes(listing.id)
            const productTitle = formatBrowseCardTitle(card.product, card.variant, pickName)
            const variantLine = !isDefaultStandardVariant(card.variant)
              ? formatVariantSummary(card.variant, locale)
              : undefined
            const cardDescription = [variantLine, formatSellerMeta(card.sellerCount, card.listingCount)]
              .filter(Boolean)
              .join(' · ')
            return (
              <ListingProductCard
                key={card.catalogKey}
                className="flex flex-col"
                title={productTitle}
                imageUrl={card.product.imageUrl}
                imageAlt={productTitle}
                description={cardDescription}
                contentClassName="flex flex-1 flex-col gap-3 text-sm"
              >
                {locationChain ? (
                  <ProductCardMarketStats
                    locationChain={locationChain}
                    askingPricePerUnit={snap.askingPricePerUnit}
                    unitLabel={unit ? formatUnitLabel(unit) : snap.unitCode}
                    officialAverage={snap.officialAverage}
                  />
                ) : null}
                <p className="text-xs text-muted-foreground">{t('browseShowcasePriceHint')}</p>
                <p>
                  <span className="text-muted-foreground">{t('available')}: </span>
                  {formatNumber(listing.availableQuantity, 0)}{' '}
                  {unit ? formatUnitLabel(unit) : listing.unitId}
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  <Link
                    to={productDetailHref(card.product.id, {
                      locationScopeId: filters.locationScopeId,
                      variantId: card.variant.id,
                    })}
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
                </div>
              </ListingProductCard>
            )
          })}
        </div>
        {(pageData?.items.length ?? 0) === 0 ? (
          <EmptyState title={t('noListings')} />
        ) : null}

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t('page')} {pageData?.page ?? 1} · {formatNumber(pageData?.total ?? 0, 0)} {t('productsWord')}
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
        <p className="text-xs text-muted-foreground">{t('viewerLabel')}: {userId}</p>
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
