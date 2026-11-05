import { ProductCombobox } from '@/components/common/ProductCombobox'
import { ListingProductCard } from '@/features/marketplace/ListingProductCard'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAppSelector } from '@/app/store/hooks'
import { selectAuthSession } from '@/features/auth/authSlice'
import {
  confirmTransactionSide,
  createListing,
  decideBid,
  estimateSellerMargin,
  listSellerTransactions,
} from '@/features/marketplace/marketplaceService'
import { ListingsBrowsePanel } from '@/features/marketplace/ListingsBrowsePanel'
import { BangladeshLocationSelector } from '@/components/common/BangladeshLocationSelector'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'
import { leafLocationId, type BangladeshLocationSelection } from '@/data/bangladeshLocationIndex'
import { validateLocationSelection } from '@/services/bangladeshLocationValidation'
import { dataLayer } from '@/data'
import type { Bid, Listing, Location, Product, Transaction, Unit } from '@/types/domain/records'
import { MetricTileGrid } from '@/components/common/MetricTileGrid'
import { RoleWorkspaceShell } from '@/components/common/RoleWorkspaceShell'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { statusLabel } from '@/lib/i18n/userFacingText'

export function SellerMarketplacePage() {
  const { t, translateError, pickName, formatNumber, locale, formatUnitLabel } = useI18n()
  const session = useAppSelector(selectAuthSession)
  const [listings, setListings] = useState<Listing[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [pendingBids, setPendingBids] = useState<Bid[]>([])
  const [salesHistory, setSalesHistory] = useState<Transaction[]>([])
  const [purchaseCost, setPurchaseCost] = useState('')
  const [bulkProductId, setBulkProductId] = useState('')
  const [bulkLocationSel, setBulkLocationSel] = useState<BangladeshLocationSelection>({
    divisionId: D.divisionKhulna,
    districtId: D.districtJashore,
    upazilaId: D.upazilaMonirampur,
    unionId: D.unionDurgapur,
  })
  const [bulkUnitId, setBulkUnitId] = useState('')
  const [bulkQuantity, setBulkQuantity] = useState('200')
  const [bulkPurchasePrice, setBulkPurchasePrice] = useState('35')
  const [bulkAskingPrice, setBulkAskingPrice] = useState('42')

  const reload = useCallback(() => {
    if (!session) return
    void Promise.all([
      dataLayer.repos.marketplace.listListings(),
      dataLayer.repos.marketplace.listBids(),
    ]).then(([listingsResult, bidsResult]) => {
      if (!listingsResult.ok || !bidsResult.ok) return
      const mine = listingsResult.data.filter((l) => l.sellerUserId === session.userId)
      const listingIds = new Set(mine.map((l) => l.id))
      setListings(mine)
      setPendingBids(bidsResult.data.filter((b) => b.status === 'pending' && listingIds.has(b.listingId)))
    })
    void listSellerTransactions(session.userId).then((result) => {
      if (result.ok) setSalesHistory(result.data)
    })
  }, [session])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    void Promise.all([
      dataLayer.repos.catalog.listProducts(),
      dataLayer.repos.catalog.listLocations(),
      dataLayer.repos.catalog.listUnits(),
    ]).then(([productsResult, locationsResult, unitsResult]) => {
      if (productsResult.ok) setProducts(productsResult.data)
      if (locationsResult.ok) setLocations(locationsResult.data)
      if (unitsResult.ok) setUnits(unitsResult.data)
      if (productsResult.ok && productsResult.data[0]) setBulkProductId(productsResult.data[0].id)
      if (unitsResult.ok && unitsResult.data[0]) setBulkUnitId(unitsResult.data[0].id)
    })
  }, [])

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])
  const listingById = useMemo(() => new Map(listings.map((l) => [l.id, l])), [listings])
  const locationMap = useMemo(() => new Map(locations.map((l) => [l.id, l])), [locations])
  const unitMap = useMemo(() => new Map(units.map((u) => [u.id, u])), [units])

  if (!session) return null

  const completedSales = salesHistory.filter((txn) => txn.status === 'completed').length

  const margin = estimateSellerMargin({
    purchasePricePerUnit: purchaseCost ? Number(purchaseCost) : undefined,
    sellingPricePerUnit: listings[0]?.askingPricePerUnit ?? 0,
    quantity: listings[0]?.availableQuantity ?? 0,
  })

  return (
    <RoleWorkspaceShell role="seller" eyebrow={t('sellerBadge')} title={t('sellerTitle')}>
      <Tabs defaultValue="overview">
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">{t('tabOverview')}</TabsTrigger>
          <TabsTrigger value="inventory">{t('tabInventory')}</TabsTrigger>
          <TabsTrigger value="offers">{t('tabOffers')}</TabsTrigger>
          <TabsTrigger value="sales">{t('tabSales')}</TabsTrigger>
          <TabsTrigger value="browse">{t('tabBrowse')}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <MetricTileGrid
            metrics={[
              { label: t('tabInventory'), value: formatNumber(listings.length, 0) },
              { label: t('pendingOffers'), value: formatNumber(pendingBids.length, 0) },
              { label: t('tabSales'), value: formatNumber(completedSales, 0) },
            ]}
          />
          <p className="text-sm text-muted-foreground">{t('overviewHint')}</p>
        </TabsContent>
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('inventoryTitle')}</CardTitle>
              <CardDescription>{t('inventoryDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {listings.length === 0 ? (
                <EmptyState title={t('noListings')} />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {listings.map((listing) => {
                    const product = productMap.get(listing.productId)
                    const location = locationMap.get(listing.locationId)
                    const productTitle = product ? pickName(product) : listing.productId
                    return (
                      <ListingProductCard
                        key={listing.id}
                        size="sm"
                        title={productTitle}
                        imageUrl={product?.imageUrl}
                        imageAlt={productTitle}
                        description={location ? pickName(location) : undefined}
                        contentClassName="space-y-1 text-sm"
                      >
                          <p>
                            {t('availableLabel')}: {formatNumber(listing.availableQuantity, 0)}
                          </p>
                          <p>
                            {t('reserved')}: {formatNumber(listing.reservedQuantity, 0)}
                          </p>
                          <p>
                            {t('sold')}: {formatNumber(listing.completedQuantity, 0)}
                          </p>
                          <p>
                            {t('status')}: {statusLabel(locale, 'listingStatus', listing.status)}
                          </p>
                      </ListingProductCard>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('bulkPurchaseTitle')}</CardTitle>
              <CardDescription>{t('bulkPurchaseDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-3 md:grid-cols-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  const validation = validateLocationSelection(bulkLocationSel)
                  if (!validation.ok) return toast.error(translateError(validation.message))
                  const locationId = leafLocationId(bulkLocationSel)
                  if (!locationId) return toast.error(translateError('locationValidationDivisionRequired'))
                  void createListing({
                    sellerUserId: session.userId,
                    productId: bulkProductId,
                    locationId: locationId,
                    unitId: bulkUnitId,
                    quantity: Number(bulkQuantity),
                    askingPricePerUnit: Number(bulkAskingPrice),
                  }).then((result) => {
                    if (!result.ok) return toast.error(translateError(result.error.message))
                    setPurchaseCost(bulkPurchasePrice)
                    toast.success(t('listingCreated'))
                    reload()
                  })
                }}
              >
                <ProductCombobox
                  label={t('product')}
                  products={products}
                  value={bulkProductId}
                  onChange={setBulkProductId}
                />
                <div className="space-y-1 md:col-span-2">
                  <BangladeshLocationSelector value={bulkLocationSel} onChange={setBulkLocationSel} required unionRequired />
                </div>
                <div className="space-y-1">
                  <Label>{t('unit')}</Label>
                  <Input value={bulkUnitId} onChange={(e) => setBulkUnitId(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>{t('quantity')}</Label>
                  <Input value={bulkQuantity} onChange={(e) => setBulkQuantity(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>{t('purchaseCostLabel')}</Label>
                  <Input value={bulkPurchasePrice} onChange={(e) => setBulkPurchasePrice(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>{t('askPrice')}</Label>
                  <Input value={bulkAskingPrice} onChange={(e) => setBulkAskingPrice(e.target.value)} />
                </div>
                <Button type="submit" className="w-full md:col-span-2 md:w-auto">
                  {t('bulkPurchaseSubmit')}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('estimatedMargin')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label>{t('purchaseCostLabel')}</Label>
                <Input value={purchaseCost} onChange={(e) => setPurchaseCost(e.target.value)} />
              </div>
              {margin.warning ? <p className="text-sm text-amber-700">{margin.warning}</p> : null}
              {margin.estimatedProfit !== null ? (
                <p className="text-sm font-medium">
                  {t('estimatedProfit')}: {formatNumber(margin.estimatedProfit)}
                </p>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  void dataLayer.repos.marketplace.listTransactions().then((result) => {
                    if (!result.ok) return
                    const txn = result.data.find(
                      (row) => row.sellerUserId === session.userId && row.status === 'awaiting_completion_confirmation',
                    )
                    if (!txn) return toast.message(t('noOpenTxn'))
                    void confirmTransactionSide({
                      userId: session.userId,
                      transactionId: txn.id,
                      side: 'seller',
                    }).then((confirm) => {
                      if (!confirm.ok) return toast.error(translateError(confirm.error.message))
                      toast.success(t('sellerConfirmed'))
                    })
                  })
                }}
              >
                {t('confirmOpenTxn')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="offers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('pendingOffers')}</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingBids.length === 0 ? (
                <EmptyState title={t('noListings')} />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {pendingBids.map((bid) => {
                    const listing = listingById.get(bid.listingId)
                    const product = listing ? productMap.get(listing.productId) : undefined
                    const location = listing ? locationMap.get(listing.locationId) : undefined
                    const unit = listing ? unitMap.get(listing.unitId) : undefined
                    const productTitle = product ? pickName(product) : bid.listingId
                    return (
                      <ListingProductCard
                        key={bid.id}
                        title={productTitle}
                        imageUrl={product?.imageUrl}
                        imageAlt={productTitle}
                        description={location ? pickName(location) : undefined}
                        contentClassName="flex flex-col gap-3 text-sm"
                      >
                        <p>
                          {t('qty')}: {formatNumber(bid.quantity, 0)}{' '}
                          {unit ? formatUnitLabel(unit) : listing?.unitId ?? ''} @{' '}
                          {formatNumber(bid.offeredPricePerUnit)}/{unit ? formatUnitLabel(unit) : t('unit')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => {
                              void decideBid({
                                sellerUserId: session.userId,
                                bidId: bid.id,
                                decision: 'accepted',
                              }).then((result) => {
                                if (!result.ok) return toast.error(translateError(result.error.message))
                                toast.success(t('offerAcceptedToast'))
                                reload()
                              })
                            }}
                          >
                            {t('accept')}
                          </Button>
                          <Button
                            size="sm"
                            type="button"
                            variant="outline"
                            onClick={() => {
                              void decideBid({
                                sellerUserId: session.userId,
                                bidId: bid.id,
                                decision: 'rejected',
                              }).then((result) => {
                                if (!result.ok) return toast.error(translateError(result.error.message))
                                toast.message(t('offerRejectedToast'))
                                reload()
                              })
                            }}
                          >
                            {t('reject')}
                          </Button>
                        </div>
                      </ListingProductCard>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('salesHistoryTitle')}</CardTitle>
              <CardDescription>{t('salesHistoryDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {salesHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('noListings')}</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {salesHistory.map((txn) => (
                    <li key={txn.id} className="rounded-md border p-3">
                      <p>
                        {t('qty')}: {formatNumber(txn.quantity, 0)} @ {formatNumber(txn.pricePerUnit)} —{' '}
                        {statusLabel(locale, 'txnStatus', txn.status)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="browse">
          <ListingsBrowsePanel userId={session.userId} />
        </TabsContent>
      </Tabs>
    </RoleWorkspaceShell>
  )
}
