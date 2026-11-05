import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { useAppSelector } from '@/app/store/hooks'
import { ROLE_DASHBOARD_PATH } from '@/constants/roles'
import { selectAuthRole, selectAuthSession } from '@/features/auth/authSlice'
import { buildProductCatalogCardBadges } from '@/features/marketplace/productCatalogCardBadges'
import { ProductDetailImage, ProductDetailInfo } from '@/features/marketplace/ProductDetailHero'
import { SubmitOfferDialog } from '@/features/marketplace/SubmitOfferDialog'
import {
  getProductSellerCompare,
  type ProductSellerCompareResult,
  type ProductSellerCompareSort,
  type ProductSellerOffer,
} from '@/services/productSellerCompare'
import { productDetailHref } from '@/services/productCatalogBrowse'
import {
  isProductSellerOfferSelectable,
  resolveBidListingId,
  validateListingEligibleForBid,
} from '@/services/listingOfferEligibility'
import {
  defaultVariantId,
  formatVariantSummary,
  isDefaultStandardVariant,
} from '@/services/productVariantCatalog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { dataLayer } from '@/data'
import { statusLabel } from '@/lib/i18n/userFacingText'
import type { Category, Listing, ProductVariant, Unit } from '@/types/domain/records'
import { cn } from 'cn'

/** ponytail: product detail only — wider than default 6xl public pages */
const PRODUCT_DETAIL_MAX = 'max-w-[90rem]'

function ProductDetailLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-36 animate-pulse rounded-md bg-muted" />
      <div className="space-y-2 border-b border-border pb-4 pl-4">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-8 w-2/3 max-w-md animate-pulse rounded bg-muted" />
        <div className="h-4 w-full max-w-lg animate-pulse rounded bg-muted" />
      </div>
      <div className="h-20 animate-pulse rounded-lg bg-muted" />
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="aspect-[4/3] animate-pulse bg-muted" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-24 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const [searchParams] = useSearchParams()
  const scopeId = searchParams.get('scope') ?? undefined
  const variantParam = searchParams.get('variant') ?? undefined
  const { t, pickName, formatNumber, translateError, locale, formatUnitLabel } = useI18n()
  const role = useAppSelector(selectAuthRole)
  const session = useAppSelector(selectAuthSession)
  const [sort, setSort] = useState<ProductSellerCompareSort>('price-asc')
  const [data, setData] = useState<ProductSellerCompareResult | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [siblingVariants, setSiblingVariants] = useState<ProductVariant[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDesktopTable, setShowDesktopTable] = useState(false)
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null)
  const [bidListing, setBidListing] = useState<Listing | null>(null)
  const [bidDialogOpen, setBidDialogOpen] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setShowDesktopTable(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    void Promise.all([
      dataLayer.repos.catalog.listUnits(),
      dataLayer.repos.catalog.listCategories(),
    ]).then(([u, c]) => {
      if (u.ok) setUnits(u.data)
      if (c.ok) setCategories(c.data)
    })
  }, [])

  const unitLabelForCode = (code: string) => {
    const unit = units.find((u) => u.code === code || u.id === code)
    return unit ? formatUnitLabel(unit) : code
  }

  useEffect(() => {
    if (!productId) return
    void dataLayer.repos.catalog.listProductVariants().then((result) => {
      if (result.ok) {
        setSiblingVariants(result.data.filter((v) => v.productId === productId))
      }
    })
  }, [productId])

  useEffect(() => {
    if (!productId) return
    setLoading(true)
    const variantId = variantParam ?? defaultVariantId(productId)
    void getProductSellerCompare(productId, { locationScopeId: scopeId, sort, variantId }).then((result) => {
      if (!result.ok) {
        setError(translateError(result.error.message))
        setData(null)
      } else {
        setError(null)
        setData(result.data)
      }
      setLoading(false)
    })
  }, [productId, scopeId, variantParam, sort, translateError])

  const selectedOffer = useMemo(
    () => data?.offers.find((o) => o.listingId === selectedListingId),
    [data?.offers, selectedListingId],
  )

  const selectedOfferSelectable = Boolean(
    selectedOffer && isProductSellerOfferSelectable(selectedOffer),
  )

  useEffect(() => {
    if (!selectedListingId || !data) return
    const stillValid = data.offers.some(
      (o) => o.listingId === selectedListingId && isProductSellerOfferSelectable(o),
    )
    if (!stillValid) setSelectedListingId(null)
  }, [data, selectedListingId])

  const openBidDialogForSelection = () => {
    const listingIdResult = resolveBidListingId(selectedListingId)
    if (!listingIdResult.ok) {
      toast.error(translateError(listingIdResult.error.message))
      return
    }
    void dataLayer.repos.marketplace.getListingById(listingIdResult.data).then((result) => {
      if (!result.ok) {
        toast.error(translateError(result.error.message))
        return
      }
      const eligible = validateListingEligibleForBid(result.data)
      if (!eligible.ok) {
        toast.error(translateError(eligible.error.message))
        setSelectedListingId(null)
        return
      }
      setBidListing(result.data)
      setBidDialogOpen(true)
    })
  }

  const renderSelectOfferControl = (offer: ProductSellerOffer) => {
    const selectable = isProductSellerOfferSelectable(offer)
    const selected = selectedListingId === offer.listingId
    return (
      <Button
        type="button"
        size="sm"
        variant={selected ? 'default' : 'secondary'}
        disabled={!selectable}
        className="h-7 px-2.5 text-xs"
        onClick={() => setSelectedListingId(offer.listingId)}
      >
        {selected ? t('offerSelectedLabel') : t('selectOfferAction')}
      </Button>
    )
  }

  const backPath = useMemo(() => (role ? ROLE_DASHBOARD_PATH[role] : '/'), [role])

  const canSelectOffer = session?.role === 'buyer'

  useEffect(() => {
    if (!canSelectOffer && selectedListingId) {
      setSelectedListingId(null)
    }
  }, [canSelectOffer, selectedListingId])

  const isBuyerWithOffers =
    canSelectOffer && data !== null && data.offers.some(isProductSellerOfferSelectable)

  const showMobileBidBar = isBuyerWithOffers && selectedOfferSelectable && selectedOffer

  if (!productId) {
    return <p className="text-sm text-destructive">{t('docTitleNotFound')}</p>
  }

  if (error) {
    return (
      <div className={cn('mx-auto space-y-4 px-4 py-8', PRODUCT_DETAIL_MAX)}>
        <p className="text-sm text-destructive">{error}</p>
        <Link to={backPath} className={buttonVariants({ variant: 'secondary' })}>
          {role ? t('backToDashboard') : t('backHome')}
        </Link>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div className={cn('mx-auto w-full px-4 py-8', PRODUCT_DETAIL_MAX)}>
        <ProductDetailLoadingSkeleton />
      </div>
    )
  }

  const productTitle = pickName(data.product)
  const category = categories.find((c) => c.id === data.product.categoryId)
  const hero = data.heroSnapshot
  const locationChain =
    hero && locale === 'bn' ? hero.locationChainBn : hero?.locationChainEn
  const officialForBadges = hero?.officialAverage ?? { status: 'insufficient_data' as const, sampleCount: 0, distinctFarmerCount: 0, productId: data.product.id, locationScopeId: scopeId ?? '', windowStart: '', windowEnd: '', calculatedAt: '' }
  const heroBadges = buildProductCatalogCardBadges(t, {
    sellerCount: data.sellerCount,
    officialAverage: officialForBadges,
  })

  const variantsForPills =
    siblingVariants.length > 0
      ? siblingVariants.some((v) => v.id === data.variant.id)
        ? siblingVariants
        : [data.variant, ...siblingVariants]
      : [data.variant]

  const variantPills = variantsForPills.map((variant) => ({
    id: variant.id,
    label: formatVariantSummary(variant, locale),
    href: productDetailHref(productId, { locationScopeId: scopeId, variantId: variant.id }),
    isCurrent: variant.id === data.variant.id,
    showDemoSampleBadge: !isDefaultStandardVariant(variant),
  }))

  const sellerCountLine = `${t('productDetailSellerCount')}: ${formatNumber(data.sellerCount, 0)} · ${t('productDetailListingCount')}: ${formatNumber(data.listingCount, 0)}`

  const isBestPriceRow = (index: number, offer: ProductSellerOffer) =>
    sort === 'price-asc' && index === 0 && isProductSellerOfferSelectable(offer)

  return (
    <div
      className={cn(
        'mx-auto w-full min-w-0 space-y-6 px-4 py-8',
        PRODUCT_DETAIL_MAX,
        showMobileBidBar && 'pb-28 lg:pb-8',
      )}
    >
      <Link to={backPath} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
        ← {role ? t('backToDashboard') : t('backHome')}
      </Link>

      <PageHeader
        eyebrow={category ? pickName(category) : undefined}
        title={productTitle}
        subtitle={t('productDetailDisclaimer')}
        className="[&_h1]:break-words"
      />

      <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:items-stretch">
        <ProductDetailImage
          imageUrl={data.product.imageUrl}
          imageAlt={productTitle}
          className="min-w-0 lg:col-start-1 lg:row-start-1"
        />

        <ProductDetailInfo
          badges={heroBadges}
          sellerCount={data.sellerCount}
          listingCount={data.listingCount}
          heroSnapshot={hero}
          locationChain={locationChain}
          unitLabel={hero ? unitLabelForCode(hero.unitCode) : ''}
          variantPills={variantPills}
          className="min-w-0 lg:col-start-2 lg:row-start-1"
        />

        <Card size="sm" className="min-w-0 gap-0 border-primary/15 py-2 shadow-sm lg:col-span-2 lg:row-start-2 [--card-spacing:--spacing(2.5)]">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-primary/10 bg-secondary/30 py-2 pb-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
            <CardTitle className="text-sm leading-none">{t('productDetailSellersTitle')}</CardTitle>
            <span className="text-[0.6875rem] text-muted-foreground">{sellerCountLine}</span>
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as ProductSellerCompareSort)}>
            <SelectTrigger
              id="product-sort"
              aria-label={t('productDetailSort')}
              className="h-7 w-full min-w-[8.5rem] shrink-0 text-xs sm:w-[9.25rem]"
            >
              <SelectValue placeholder={t('productDetailSort')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">{t('productDetailSortPriceAsc')}</SelectItem>
              <SelectItem value="price-desc">{t('productDetailSortPriceDesc')}</SelectItem>
              <SelectItem value="newest">{t('productDetailSortNewest')}</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="min-w-0 overflow-x-auto px-0 pt-0 pb-0">
          {data.offers.length === 0 ? (
            <div className="px-3 py-4">
              <EmptyState title={t('productDetailNoOffers')} />
            </div>
          ) : showDesktopTable ? (
            <Table className="text-xs [&_td]:px-2 [&_td]:py-1.5 [&_th]:h-8 [&_th]:px-2 [&_th]:py-1">
              <TableHeader className="sticky top-0 z-[1] bg-card">
                <TableRow>
                  <TableHead className="w-[14%]">{t('productDetailColSeller')}</TableHead>
                  <TableHead className="w-[11%]">{t('listingPrice')}</TableHead>
                  <TableHead className="w-[9%]">{t('available')}</TableHead>
                  <TableHead className="w-[9%]">{t('productDetailColStatus')}</TableHead>
                  <TableHead className="min-w-[10rem]">{t('productDetailColLocation')}</TableHead>
                  <TableHead className="w-[12%]">{t('productDetailColPhone')}</TableHead>
                  <TableHead className="w-[14%]">{t('productDetailColAction')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.offers.map((offer, index) => {
                  const chain = locale === 'bn' ? offer.locationChainBn : offer.locationChainEn
                  return (
                    <TableRow
                      key={offer.listingId}
                      className={cn(
                        index % 2 === 1 ? 'bg-muted/20' : undefined,
                        isBestPriceRow(index, offer) && 'bg-primary/5',
                        canSelectOffer &&
                          selectedListingId === offer.listingId &&
                          'ring-1 ring-inset ring-primary',
                        !isProductSellerOfferSelectable(offer) && 'opacity-60',
                      )}
                    >
                      <TableCell className="whitespace-normal align-middle font-medium">
                        {offer.sellerDisplayName}
                      </TableCell>
                      <TableCell className="tabular-nums font-medium align-middle">
                        {formatNumber(offer.askingPricePerUnit)}/{unitLabelForCode(offer.unitCode)}
                      </TableCell>
                      <TableCell className="tabular-nums align-middle">
                        {formatNumber(offer.availableQuantity, 0)}
                      </TableCell>
                      <TableCell className="align-middle text-xs">
                        {statusLabel(locale, 'listingStatus', offer.listingStatus)}
                      </TableCell>
                      <TableCell className="max-w-[12rem] whitespace-normal align-middle text-[0.6875rem] leading-snug">
                        {chain}
                      </TableCell>
                      <TableCell className="whitespace-normal align-middle text-[0.6875rem]">
                        <span className="font-mono">{offer.phonePlaceholder}</span>
                      </TableCell>
                      <TableCell className="whitespace-normal align-middle">
                        <div className="flex flex-wrap gap-1">
                          {canSelectOffer ? renderSelectOfferControl(offer) : null}
                          <Link
                            to={`/listing/${offer.listingId}`}
                            className={buttonVariants({
                              variant: 'outline',
                              size: 'sm',
                              className: 'h-7 px-2 text-xs',
                            })}
                          >
                            {t('productDetailViewOffer')}
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <ul className="space-y-2 px-3 pb-3">
              {data.offers.map((offer, index) => {
                const chain = locale === 'bn' ? offer.locationChainBn : offer.locationChainEn
                const selectable = isProductSellerOfferSelectable(offer)
                return (
                  <li
                    key={offer.listingId}
                    className={cn(
                      'rounded-md border p-2.5 text-xs',
                      isBestPriceRow(index, offer) && 'border-primary/30 bg-primary/5',
                      canSelectOffer &&
                        selectedListingId === offer.listingId &&
                        'ring-2 ring-primary',
                      !selectable && 'opacity-60',
                    )}
                  >
                    <p className="tabular-nums text-base font-semibold leading-tight text-foreground">
                      {formatNumber(offer.askingPricePerUnit)}/{unitLabelForCode(offer.unitCode)}
                    </p>
                    <p className="mt-0.5 font-medium">{offer.sellerDisplayName}</p>
                    <p className="text-[0.6875rem] text-muted-foreground">
                      {t('available')}: {formatNumber(offer.availableQuantity, 0)} ·{' '}
                      {statusLabel(locale, 'listingStatus', offer.listingStatus)}
                    </p>
                    <p className="mt-0.5 text-[0.6875rem] leading-snug break-words">{chain}</p>
                    <p className="mt-0.5 font-mono text-[0.6875rem]">{offer.phonePlaceholder}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {canSelectOffer ? renderSelectOfferControl(offer) : null}
                      <Link
                        to={`/listing/${offer.listingId}`}
                        className={buttonVariants({ variant: 'outline', size: 'sm', className: 'h-7 px-2 text-xs' })}
                      >
                        {t('productDetailViewOffer')}
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
        </Card>
      </div>

      {isBuyerWithOffers ? (
        <Card className={cn('border-border/80 shadow-xs', showMobileBidBar && 'hidden lg:block')}>
          <CardHeader>
            <CardTitle>{t('selectedOfferSummary')}</CardTitle>
            <CardDescription>{t('browseSelectSellerToBid')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedOfferSelectable && selectedOffer ? (
              <>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">{t('selectedSellerHeading')}</dt>
                    <dd className="font-medium">{selectedOffer.sellerDisplayName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">{t('listingPrice')}</dt>
                    <dd className="tabular-nums font-medium">
                      {formatNumber(selectedOffer.askingPricePerUnit)}/
                      {unitLabelForCode(selectedOffer.unitCode)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">{t('available')}</dt>
                    <dd className="tabular-nums">
                      {formatNumber(selectedOffer.availableQuantity, 0)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">{t('productDetailColLocation')}</dt>
                    <dd className="text-xs break-words">
                      {locale === 'bn' ? selectedOffer.locationChainBn : selectedOffer.locationChainEn}
                    </dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelectedListingId(null)}>
                    {t('changeSelectedOffer')}
                  </Button>
                  <Button type="button" size="sm" onClick={openBidDialogForSelection}>
                    {t('submitOfferFromSelection')}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">{t('selectOfferBeforeBid')}</p>
                <Button type="button" size="sm" disabled>
                  {t('submitOfferFromSelection')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : null}

      {showMobileBidBar && selectedOffer ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 shadow-lg backdrop-blur-sm lg:hidden">
          <div className={cn('mx-auto flex items-center gap-3 px-4', PRODUCT_DETAIL_MAX)}>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-muted-foreground">{selectedOffer.sellerDisplayName}</p>
              <p className="tabular-nums text-sm font-semibold">
                {formatNumber(selectedOffer.askingPricePerUnit)}/{unitLabelForCode(selectedOffer.unitCode)}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setSelectedListingId(null)}>
              {t('changeSelectedOffer')}
            </Button>
            <Button type="button" size="sm" onClick={openBidDialogForSelection}>
              {t('submitOfferFromSelection')}
            </Button>
          </div>
        </div>
      ) : null}

      {session?.role === 'buyer' ? (
        <SubmitOfferDialog
          open={bidDialogOpen}
          listing={bidListing}
          buyerUserId={session.userId}
          onOpenChange={(open) => {
            setBidDialogOpen(open)
            if (!open) setBidListing(null)
          }}
          onSubmitted={() => {
            setSelectedListingId(null)
          }}
        />
      ) : null}
    </div>
  )
}
