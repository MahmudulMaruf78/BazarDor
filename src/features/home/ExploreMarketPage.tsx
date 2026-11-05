import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { dataLayer } from '@/data'
import { ListingProductCard } from '@/features/marketplace/ListingProductCard'
import { ProductCardMarketStats } from '@/features/marketplace/ProductCardMarketStats'
import { buildExploreLeafSnapshots } from '@/services/productCardMarketSnapshot'
import { productDetailHref } from '@/services/productCatalogBrowse'
import {
  formatBrowseCardTitle,
  formatVariantSummary,
  isDefaultStandardVariant,
} from '@/services/productVariantCatalog'
import {
  getBangladeshChildren,
  getBangladeshLocationById,
  getBangladeshLocationParentId,
  type BangladeshLocationNode,
} from '@/data/bangladeshLocationIndex'
import type { Listing, Location, PriceEntry, Product, ProductVariant, Unit } from '@/types/domain/records'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { cn } from 'cn'

function exploreStepMessage(path: Location[]): 'explorePickDivision' | 'explorePickDistrict' | 'explorePickUpazila' | 'explorePickUnion' {
  if (path.length === 0) return 'explorePickDivision'
  const last = path[path.length - 1]!
  if (last.type === 'division') return 'explorePickDistrict'
  if (last.type === 'district') return 'explorePickUpazila'
  if (last.type === 'upazila') return 'explorePickUnion'
  return 'explorePickUnion'
}

function nodeToLocation(node: BangladeshLocationNode): Location {
  const parentId = getBangladeshLocationParentId(node.id)
  return {
    id: node.id,
    nameEn: node.nameEn,
    nameBn: node.nameBn,
    type: node.type,
    dataSource: node.dataSource,
    ...(parentId ? { parentId } : {}),
    ...(node.officialId ? { officialId: node.officialId } : {}),
    ...(node.bbsCode ? { bbsCode: node.bbsCode } : {}),
    ...(node.demoCentroid ? { demoCentroid: node.demoCentroid } : {}),
    ...(node.mapBoundaryId ? { mapBoundaryId: node.mapBoundaryId } : {}),
  }
}

export function ExploreMarketPage() {
  const { t, pickName, locale, formatUnitLabel, formatNumber } = useI18n()
  const [path, setPath] = useState<Location[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [entries, setEntries] = useState<PriceEntry[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void Promise.all([
      dataLayer.repos.catalog.listLocations(),
      dataLayer.repos.catalog.listProducts(),
      dataLayer.repos.catalog.listProductVariants(),
      dataLayer.repos.marketplace.listListings(),
      dataLayer.repos.prices.listPriceEntries(),
      dataLayer.repos.catalog.listUnits(),
    ]).then(([loc, prod, varResult, list, pe, u]) => {
      if (loc.ok) setLocations(loc.data)
      if (prod.ok) setProducts(prod.data)
      if (varResult.ok) setVariants(varResult.data)
      if (list.ok) setListings(list.data)
      if (pe.ok) setEntries(pe.data)
      if (u.ok) setUnits(u.data)
      setLoading(false)
    })
  }, [])

  const current = path[path.length - 1]
  const atLeaf = current != null && getBangladeshChildren(current.id).length === 0
  const choices = useMemo(() => {
    if (atLeaf) return []
    const parentId = current?.id
    return getBangladeshChildren(parentId).map(nodeToLocation)
  }, [atLeaf, current?.id])

  const leafRows = useMemo(() => {
    if (!atLeaf || !current) return []
    return buildExploreLeafSnapshots(current.id, products, variants, listings, entries, locations, units)
  }, [atLeaf, current, products, variants, listings, entries, locations, units])

  const locationChainFor = (row: { locationChainEn: string; locationChainBn: string }) =>
    locale === 'bn' ? row.locationChainBn : row.locationChainEn

  const stepKey = exploreStepMessage(path)

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-2">
          <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground" aria-label={t('exploreTitle')}>
            <Link to="/" className="text-primary hover:underline">
              {t('exploreBreadcrumbHome')}
            </Link>
            {path.map((loc) => (
              <span key={loc.id}>
                {' / '}
                {pickName(loc)}
              </span>
            ))}
          </nav>
        </CardHeader>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t('exploreTitle')}</h1>
        {path.length > 0 ? (
          <Button type="button" variant="outline" size="sm" onClick={() => setPath((p) => p.slice(0, -1))}>
            {t('exploreBack')}
          </Button>
        ) : null}
      </div>

      {loading ? (
        <LoadingState />
      ) : atLeaf && current ? (
        <Card className="border-border/80 shadow-xs">
          <CardHeader>
            <CardTitle>{pickName(current)}</CardTitle>
            <CardDescription>{t('sampleProducts')}</CardDescription>
          </CardHeader>
          <CardContent>
            {leafRows.length === 0 ? (
              <EmptyState title={t('exploreNoListings')} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {leafRows.map(({ product, variant, catalogKey, snapshot, sellerCount, listingCount }) => {
                  const unit = units.find((u) => u.code === snapshot.unitCode)
                  const unitLabel = unit ? formatUnitLabel(unit) : snapshot.unitCode
                  const title = formatBrowseCardTitle(product, variant, pickName)
                  const variantLine = !isDefaultStandardVariant(variant)
                    ? formatVariantSummary(variant, locale)
                    : undefined
                  const sellerMeta = `${t('productCardSellerCount').replace('{count}', formatNumber(sellerCount, 0))} · ${t('productCardListingCount').replace('{count}', formatNumber(listingCount, 0))}`
                  const description = [variantLine, sellerMeta].filter(Boolean).join(' · ')
                  return (
                  <ListingProductCard
                    key={catalogKey}
                    size="sm"
                    to={productDetailHref(product.id, { locationScopeId: current.id, variantId: variant.id })}
                    title={title}
                    imageUrl={product.imageUrl}
                    imageAlt={title}
                    description={description}
                    contentClassName="pt-0"
                  >
                    <ProductCardMarketStats
                      locationChain={locationChainFor(snapshot)}
                      askingPricePerUnit={snapshot.askingPricePerUnit}
                      unitLabel={unitLabel}
                      officialAverage={snapshot.officialAverage}
                    />
                  </ListingProductCard>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/80 shadow-xs">
          <CardHeader>
            <CardTitle>{t(stepKey)}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {choices.map((loc) => {
              const node = getBangladeshLocationById(loc.id)
              if (!node) return null
              return (
                <Button
                  key={loc.id}
                  type="button"
                  variant="outline"
                  className={cn(
                    'h-auto min-h-[3.5rem] justify-start rounded-lg border-border/80 py-3 text-left shadow-xs transition-colors hover:border-primary/40 hover:bg-muted/40',
                  )}
                  onClick={() => setPath((p) => [...p, nodeToLocation(node)])}
                >
                  {pickName(loc)}
                </Button>
              )
            })}
          </CardContent>
        </Card>
      )}

      <Link to="/" className={buttonVariants({ variant: 'ghost' })}>
        ← {t('backHome')}
      </Link>
    </div>
  )
}
