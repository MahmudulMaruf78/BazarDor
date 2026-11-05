import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { useAppSelector } from '@/app/store/hooks'
import { selectAuthRole, selectAuthSession } from '@/features/auth/authSlice'
import { ROLE_DASHBOARD_PATH } from '@/constants/roles'
import { dataLayer } from '@/data'
import { ListingProductCard } from '@/features/marketplace/ListingProductCard'
import { ProductCardMarketStats } from '@/features/marketplace/ProductCardMarketStats'
import { snapshotsForListings } from '@/services/productCardMarketSnapshot'
import type { Listing, Location, PriceEntry, Product, Unit } from '@/types/domain/records'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ListingDetailPage() {
  const { listingId } = useParams<{ listingId: string }>()
  const { t, pickName, formatNumber, translateError, locale } = useI18n()
  const session = useAppSelector(selectAuthSession)
  const role = useAppSelector(selectAuthRole)
  const [listing, setListing] = useState<Listing | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [priceEntries, setPriceEntries] = useState<PriceEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!listingId) return
    void dataLayer.repos.marketplace.getListingById(listingId).then(async (result) => {
      if (!result.ok) {
        setError(translateError(result.error.message))
        return
      }
      setListing(result.data)
      const [products, locs, u, pe] = await Promise.all([
        dataLayer.repos.catalog.listProducts(),
        dataLayer.repos.catalog.listLocations(),
        dataLayer.repos.catalog.listUnits(),
        dataLayer.repos.prices.listPriceEntries(),
      ])
      if (products.ok) setProduct(products.data.find((p) => p.id === result.data.productId) ?? null)
      if (locs.ok) setLocations(locs.data)
      if (u.ok) setUnits(u.data)
      if (pe.ok) setPriceEntries(pe.data)
    })
  }, [listingId, translateError])

  const snapshot = useMemo(() => {
    if (!listing || locations.length === 0 || units.length === 0) return undefined
    return snapshotsForListings([listing], priceEntries, locations, units).get(listing.id)
  }, [listing, priceEntries, locations, units])

  const locationChain =
    snapshot && locale === 'bn' ? snapshot.locationChainBn : snapshot?.locationChainEn

  const backPath = useMemo(() => (role ? ROLE_DASHBOARD_PATH[role] : '/'), [role])
  const productTitle = product ? pickName(product) : listing?.productId ?? t('loading')
  const unit = units.find((u) => u.id === listing?.unitId)

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">{error}</p>
        <Link to={backPath} className={buttonVariants({ variant: 'secondary' })}>
          {t('backToDashboard')}
        </Link>
      </div>
    )
  }

  if (!listing) {
    return <p className="text-sm text-bazardor-muted">{t('loading')}</p>
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link to={backPath} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
        ← {t('backToDashboard')}
      </Link>
      <ListingProductCard
        title={productTitle}
        imageUrl={product?.imageUrl}
        imageAlt={productTitle}
        contentClassName="space-y-3 text-sm"
      >
        {snapshot && locationChain ? (
          <ProductCardMarketStats
            locationChain={locationChain}
            askingPricePerUnit={snapshot.askingPricePerUnit}
            unitCode={snapshot.unitCode}
            officialAverage={snapshot.officialAverage}
          />
        ) : null}
        <p>
          {t('available')}: {formatNumber(listing.availableQuantity, 0)} {unit?.code ?? listing.unitId}
        </p>
        <p>
          {t('reserved')}: {formatNumber(listing.reservedQuantity, 0)}
        </p>
        <p>
          {t('sold')}: {formatNumber(listing.completedQuantity, 0)}
        </p>
        <p className="text-xs text-bazardor-muted">{t('listingDetailDisclaimer')}</p>
      </ListingProductCard>
      {session?.role === 'buyer' ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('offer')}</CardTitle>
            <CardDescription>{t('listingDetailBidHint')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/buyer" className={buttonVariants()}>
              {t('goToBuyerOffers')}
            </Link>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
