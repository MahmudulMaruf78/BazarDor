import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { useAppSelector } from '@/app/store/hooks'
import { ROLE_DASHBOARD_PATH } from '@/constants/roles'
import { selectAuthRole } from '@/features/auth/authSlice'
import { ListingProductCard } from '@/features/marketplace/ListingProductCard'
import { ProductCardMarketStats } from '@/features/marketplace/ProductCardMarketStats'
import {
  getProductSellerCompare,
  type ProductSellerCompareResult,
  type ProductSellerCompareSort,
} from '@/services/productSellerCompare'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const [searchParams] = useSearchParams()
  const scopeId = searchParams.get('scope') ?? undefined
  const { t, pickName, formatNumber, translateError, locale } = useI18n()
  const role = useAppSelector(selectAuthRole)
  const [sort, setSort] = useState<ProductSellerCompareSort>('price-asc')
  const [data, setData] = useState<ProductSellerCompareResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!productId) return
    setLoading(true)
    void getProductSellerCompare(productId, { locationScopeId: scopeId, sort }).then((result) => {
      if (!result.ok) {
        setError(translateError(result.error.message))
        setData(null)
      } else {
        setError(null)
        setData(result.data)
      }
      setLoading(false)
    })
  }, [productId, scopeId, sort, translateError])

  const backPath = useMemo(() => (role ? ROLE_DASHBOARD_PATH[role] : '/'), [role])
  const hero = data?.heroSnapshot
  const locationChain =
    hero && locale === 'bn' ? hero.locationChainBn : hero?.locationChainEn

  if (!productId) {
    return <p className="text-sm text-destructive">{t('docTitleNotFound')}</p>
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <p className="text-sm text-destructive">{error}</p>
        <Link to={backPath} className={buttonVariants({ variant: 'secondary' })}>
          {role ? t('backToDashboard') : t('backHome')}
        </Link>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-bazardor-muted">{t('loading')}</p>
      </div>
    )
  }

  const productTitle = pickName(data.product)

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Link to={backPath} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
        ← {role ? t('backToDashboard') : t('backHome')}
      </Link>

      <ListingProductCard
        title={productTitle}
        imageUrl={data.product.imageUrl}
        imageAlt={productTitle}
        contentClassName="space-y-3"
      >
        {hero && locationChain ? (
          <ProductCardMarketStats
            locationChain={locationChain}
            askingPricePerUnit={hero.askingPricePerUnit}
            unitCode={hero.unitCode}
            officialAverage={hero.officialAverage}
          />
        ) : null}
        <p className="text-sm text-bazardor-muted">{t('productDetailDisclaimer')}</p>
      </ListingProductCard>

      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>{t('productDetailSellersTitle')}</CardTitle>
            <CardDescription>
              {t('productDetailSellerCount')}: {formatNumber(data.sellerCount, 0)}
            </CardDescription>
          </div>
          <div className="w-full space-y-1 sm:w-48">
            <Label htmlFor="product-sort">{t('productDetailSort')}</Label>
            <Select value={sort} onValueChange={(v) => setSort(v as ProductSellerCompareSort)}>
              <SelectTrigger id="product-sort" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-asc">{t('productDetailSortPriceAsc')}</SelectItem>
                <SelectItem value="price-desc">{t('productDetailSortPriceDesc')}</SelectItem>
                <SelectItem value="newest">{t('productDetailSortNewest')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {data.offers.length === 0 ? (
            <p className="text-sm text-bazardor-muted">{t('productDetailNoOffers')}</p>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('productDetailColSeller')}</TableHead>
                      <TableHead>{t('listingPrice')}</TableHead>
                      <TableHead>{t('available')}</TableHead>
                      <TableHead>{t('productDetailColLocation')}</TableHead>
                      <TableHead>{t('productDetailColPhone')}</TableHead>
                      <TableHead>{t('productDetailColAction')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.offers.map((offer) => {
                      const chain = locale === 'bn' ? offer.locationChainBn : offer.locationChainEn
                      return (
                        <TableRow key={offer.listingId}>
                          <TableCell>{offer.sellerDisplayName}</TableCell>
                          <TableCell className="tabular-nums font-medium">
                            {formatNumber(offer.askingPricePerUnit)}/{offer.unitCode}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {formatNumber(offer.availableQuantity, 0)}
                          </TableCell>
                          <TableCell className="max-w-[200px] text-xs">{chain}</TableCell>
                          <TableCell className="text-xs">
                            <span className="font-mono">{offer.phonePlaceholder}</span>
                            <Badge className="ml-2" variant="secondary">
                              {t('demoLabel')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Link
                              to={`/listing/${offer.listingId}`}
                              className={buttonVariants({ variant: 'outline', size: 'sm' })}
                            >
                              {t('productDetailViewOffer')}
                            </Link>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              <ul className="space-y-3 md:hidden">
                {data.offers.map((offer) => {
                  const chain = locale === 'bn' ? offer.locationChainBn : offer.locationChainEn
                  return (
                    <li key={offer.listingId} className="rounded-md border p-3 text-sm">
                      <p className="font-medium">{offer.sellerDisplayName}</p>
                      <p className="mt-1 tabular-nums font-semibold text-bazardor-navy">
                        {formatNumber(offer.askingPricePerUnit)}/{offer.unitCode}
                      </p>
                      <p className="text-xs text-bazardor-muted">
                        {t('available')}: {formatNumber(offer.availableQuantity, 0)}
                      </p>
                      <p className="mt-1 text-xs">{chain}</p>
                      <p className="mt-1 font-mono text-xs">
                        {offer.phonePlaceholder}{' '}
                        <Badge variant="secondary">{t('demoLabel')}</Badge>
                      </p>
                      <Link
                        to={`/listing/${offer.listingId}`}
                        className={buttonVariants({ variant: 'outline', size: 'sm', className: 'mt-2 w-full' })}
                      >
                        {t('productDetailViewOffer')}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
