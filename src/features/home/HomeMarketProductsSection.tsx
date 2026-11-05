import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { dataLayer } from '@/data'
import { deepestScopeLocationId, type BangladeshLocationSelection } from '@/data/bangladeshLocationIndex'
import { ListingCatalogFilterBar } from '@/features/marketplace/ListingCatalogFilterBar'
import { ListingProductCard } from '@/features/marketplace/ListingProductCard'
import { browseListings, type ListingFilters } from '@/features/marketplace/marketplaceService'
import { ProductCardMarketStats } from '@/features/marketplace/ProductCardMarketStats'
import { snapshotsForListings } from '@/services/productCardMarketSnapshot'
import type { Category, Location, PriceEntry, Product, Unit } from '@/types/domain/records'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/** ponytail: raise pageSize + pager if home catalog grows */
const HOME_LISTING_PAGE_SIZE = 50

export function HomeMarketProductsSection() {
  const { t, pickName, locale } = useI18n()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [priceEntries, setPriceEntries] = useState<PriceEntry[]>([])
  const [locationSel, setLocationSel] = useState<BangladeshLocationSelection>({ divisionId: '' })
  const [filters, setFilters] = useState<ListingFilters>({
    page: 1,
    pageSize: HOME_LISTING_PAGE_SIZE,
    sort: 'newest',
  })
  const [items, setItems] = useState<import('@/features/marketplace/marketplaceService').ListingPage['items']>([])
  const [loading, setLoading] = useState(true)

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
    setLoading(true)
    void browseListings(filters).then((result) => {
      if (result.ok) setItems(result.data.items)
      else setItems([])
      setLoading(false)
    })
  }, [filters])

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const listingSnapshots = useMemo(() => {
    if (!items.length || locations.length === 0 || units.length === 0) {
      return new Map<string, import('@/services/productCardMarketSnapshot').ProductCardMarketSnapshot>()
    }
    return snapshotsForListings(items, priceEntries, locations, units)
  }, [items, priceEntries, locations, units])

  const locationChainFor = (listingId: string) => {
    const snap = listingSnapshots.get(listingId)
    if (!snap) return ''
    return locale === 'bn' ? snap.locationChainBn : snap.locationChainEn
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sampleProducts')}</CardTitle>
        <CardDescription>{t('fromSeed')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ListingCatalogFilterBar
          categories={categories}
          categoryId={filters.categoryId}
          onCategoryChange={(categoryId) =>
            setFilters((prev) => ({ ...prev, categoryId, page: 1 }))
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
        />

        {loading ? (
          <p className="text-sm text-bazardor-muted">{t('loading')}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-bazardor-muted">{t('noListings')}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((listing) => {
              const product = productMap.get(listing.productId)
              const snap = listingSnapshots.get(listing.id)
              const title = product ? pickName(product) : listing.productId
              return (
                <ListingProductCard
                  key={listing.id}
                  size="sm"
                  to={`/product/${listing.productId}`}
                  title={title}
                  imageUrl={product?.imageUrl}
                  imageAlt={title}
                  contentClassName="flex flex-col gap-3 pt-0"
                >
                  {snap ? (
                    <ProductCardMarketStats
                      locationChain={locationChainFor(listing.id)}
                      askingPricePerUnit={snap.askingPricePerUnit}
                      unitCode={snap.unitCode}
                      officialAverage={snap.officialAverage}
                    />
                  ) : null}
                </ListingProductCard>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
