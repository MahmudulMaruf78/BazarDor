import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { dataLayer } from '@/data'
import { deepestScopeLocationId, type BangladeshLocationSelection } from '@/data/bangladeshLocationIndex'
import { ListingCatalogFilterBar } from '@/features/marketplace/ListingCatalogFilterBar'
import { ListingProductCard } from '@/features/marketplace/ListingProductCard'
import { buildProductCatalogCardBadges } from '@/features/marketplace/productCatalogCardBadges'
import { browseProductCatalog, type ListingFilters } from '@/features/marketplace/marketplaceService'
import { ProductCardMarketStats } from '@/features/marketplace/ProductCardMarketStats'
import { productDetailHref } from '@/services/productCatalogBrowse'
import {
  formatVariantSummary,
  isDefaultStandardVariant,
} from '@/services/productVariantCatalog'
import type { Category, Product, ProductVariant, Unit } from '@/types/domain/records'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'

/** ponytail: raise pageSize + pager if home catalog grows */
const HOME_LISTING_PAGE_SIZE = 50

export function HomeMarketProductsSection() {
  const { t, pickName, locale, formatUnitLabel, formatNumber } = useI18n()
  const [categories, setCategories] = useState<Category[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [locationSel, setLocationSel] = useState<BangladeshLocationSelection>({ divisionId: '' })
  const [filters, setFilters] = useState<ListingFilters>({
    page: 1,
    pageSize: HOME_LISTING_PAGE_SIZE,
    sort: 'newest',
  })
  const [pageData, setPageData] = useState<
    import('@/services/productCatalogBrowse').ProductBrowsePage | undefined
  >()
  const [loading, setLoading] = useState(true)

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

  const unitMap = useMemo(() => new Map(units.map((u) => [u.id, u])), [units])

  const variantFilterOptions = useMemo(() => {
    if (!filters.categoryId) return variants
    const productIds = new Set(
      products.filter((p) => p.categoryId === filters.categoryId).map((p) => p.id),
    )
    return variants.filter((v) => productIds.has(v.productId))
  }, [variants, products, filters.categoryId])

  useEffect(() => {
    setLoading(true)
    void browseProductCatalog(filters).then((result) => {
      if (result.ok) setPageData(result.data)
      else setPageData(undefined)
      setLoading(false)
    })
  }, [filters])

  const formatSellerMeta = (sellerCount: number, listingCount: number) => {
    const sellers = t('productCardSellerCount').replace('{count}', formatNumber(sellerCount, 0))
    const listings = t('productCardListingCount').replace('{count}', formatNumber(listingCount, 0))
    return `${sellers} · ${listings}`
  }

  return (
    <Card className="overflow-hidden border-primary/20 bg-card/95 shadow-sm">
      <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-secondary/80 to-primary/[0.08] px-3 sm:px-4 md:px-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t('marketplaceCatalog')}</p>
        <CardTitle className="mt-1 text-foreground">{t('sampleProducts')}</CardTitle>
        <CardDescription>{t('fromSeed')}</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 space-y-4 overflow-x-hidden px-3 sm:px-4 md:px-5">
        <ListingCatalogFilterBar
          categories={categories}
          categoryId={filters.categoryId}
          onCategoryChange={(categoryId) =>
            setFilters((prev) => ({ ...prev, categoryId, variantId: undefined, page: 1 }))
          }
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
            setLocationSel({ divisionId: '' })
            setFilters((prev) => ({
              ...prev,
              categoryId: undefined,
              variantId: undefined,
              locationScopeId: undefined,
              page: 1,
            }))
          }}
        />

        {loading ? (
          <LoadingState />
        ) : !pageData?.items.length ? (
          <EmptyState title={t('noListings')} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {pageData.items.map((card) => {
              const snap = card.snapshot
              const unit = unitMap.get(card.showcaseListing.unitId)
              const unitLabel = unit ? formatUnitLabel(unit) : snap.unitCode
              const title = pickName(card.product)
              const locationChain = locale === 'bn' ? snap.locationChainBn : snap.locationChainEn
              const variantLine = !isDefaultStandardVariant(card.variant)
                ? formatVariantSummary(card.variant, locale)
                : undefined
              const description = [variantLine, formatSellerMeta(card.sellerCount, card.listingCount)]
                .filter(Boolean)
                .join(' · ')
              return (
                <ListingProductCard
                  key={card.catalogKey}
                  size="default"
                  showViewHint
                  badges={buildProductCatalogCardBadges(t, {
                    sellerCount: card.sellerCount,
                    officialAverage: snap.officialAverage,
                  })}
                  to={productDetailHref(card.product.id, {
                    locationScopeId: filters.locationScopeId,
                    variantId: card.variant.id,
                  })}
                  title={title}
                  imageUrl={card.product.imageUrl}
                  imageAlt={title}
                  description={description}
                  contentClassName="flex flex-col gap-3 pt-0"
                >
                  <ProductCardMarketStats
                    locationChain={locationChain}
                    askingPricePerUnit={snap.askingPricePerUnit}
                    unitLabel={unitLabel}
                    officialAverage={snap.officialAverage}
                  />
                </ListingProductCard>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
