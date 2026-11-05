import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { useAppSelector } from '@/app/store/hooks'
import { selectAuthSession } from '@/features/auth/authSlice'
import {
  cancelTransaction,
  confirmTransactionSide,
} from '@/features/marketplace/marketplaceService'
import { ListingsBrowsePanel, useFavoriteListingIds } from '@/features/marketplace/ListingsBrowsePanel'
import { dataLayer } from '@/data'
import type { Bid, Product, Transaction } from '@/types/domain/records'
import { statusLabel } from '@/lib/i18n/userFacingText'
import { ListingProductCard } from '@/features/marketplace/ListingProductCard'
import { MetricTileGrid } from '@/components/common/MetricTileGrid'
import { RoleWorkspaceShell } from '@/components/common/RoleWorkspaceShell'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function BuyerMarketplacePage() {
  const { t, locale, translateError, formatNumber } = useI18n()
  const session = useAppSelector(selectAuthSession)
  const { favoriteIds, setFavoriteIds } = useFavoriteListingIds()
  const [bids, setBids] = useState<Bid[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const reload = useCallback(() => {
    if (!session) return
    void dataLayer.repos.marketplace.listBids().then((result) => {
      if (result.ok) setBids(result.data.filter((b) => b.buyerUserId === session.userId))
    })
    void dataLayer.repos.marketplace.listTransactions().then((result) => {
      if (result.ok) setTransactions(result.data.filter((txn) => txn.buyerUserId === session.userId))
    })
  }, [session])

  useEffect(() => {
    reload()
  }, [reload])

  if (!session) return null

  const openTxnCount = transactions.filter((txn) => txn.status === 'awaiting_completion_confirmation').length

  return (
    <RoleWorkspaceShell role="buyer" eyebrow={t('buyerBadge')} title={t('buyerTitle')}>
      <Tabs defaultValue="overview">
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">{t('tabOverview')}</TabsTrigger>
          <TabsTrigger value="browse">{t('tabBrowse')}</TabsTrigger>
          <TabsTrigger value="bids">{t('tabBids')}</TabsTrigger>
          <TabsTrigger value="favourites">{t('tabFavourites')}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <MetricTileGrid
            metrics={[
              { label: t('tabBids'), value: formatNumber(bids.length, 0) },
              { label: t('transaction'), value: formatNumber(openTxnCount, 0) },
              { label: t('tabFavourites'), value: formatNumber(favoriteIds.length, 0) },
            ]}
          />
          <p className="text-sm text-muted-foreground">{t('overviewHint')}</p>
          <p className="text-sm text-muted-foreground">{t('browseSelectSellerToBid')}</p>
        </TabsContent>
        <TabsContent value="browse">
          <ListingsBrowsePanel
            userId={session.userId}
            canFavorite
            favoriteIds={favoriteIds}
            onFavoritesChange={setFavoriteIds}
          />
        </TabsContent>
        <TabsContent value="bids">
          <Card>
            <CardHeader>
              <CardTitle>{t('myBidsTxns')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('bid')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('qty')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bids.map((bid) => (
                    <TableRow key={bid.id}>
                      <TableCell>{bid.id}</TableCell>
                      <TableCell>{statusLabel(locale, 'bidStatus', bid.status)}</TableCell>
                      <TableCell>{bid.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('transaction')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell>{txn.id}</TableCell>
                      <TableCell>{statusLabel(locale, 'txnStatus', txn.status)}</TableCell>
                      <TableCell className="space-x-2">
                        {txn.status === 'awaiting_completion_confirmation' ? (
                          <>
                            <Button
                              size="sm"
                              type="button"
                              onClick={() => {
                                void confirmTransactionSide({
                                  userId: session.userId,
                                  transactionId: txn.id,
                                  side: 'buyer',
                                }).then((result) => {
                                  if (!result.ok) return toast.error(translateError(result.error.message))
                                  toast.success(t('buyerConfirmed'))
                                  reload()
                                })
                              }}
                            >
                              {t('confirm')}
                            </Button>
                            <Button
                              size="sm"
                              type="button"
                              variant="outline"
                              onClick={() => {
                                void cancelTransaction({ userId: session.userId, transactionId: txn.id }).then(
                                  (result) => {
                                    if (!result.ok) return toast.error(translateError(result.error.message))
                                    toast.message(t('reservationReleased'))
                                    reload()
                                  },
                                )
                              }}
                            >
                              {t('cancelTxn')}
                            </Button>
                          </>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="favourites">
          <FavouritesPanel favoriteIds={favoriteIds} />
        </TabsContent>
      </Tabs>
    </RoleWorkspaceShell>
  )
}

function FavouritesPanel({ favoriteIds }: { favoriteIds: string[] }) {
  const { t, pickName } = useI18n()
  const [listings, setListings] = useState<import('@/types/domain/records').Listing[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    void dataLayer.repos.catalog.listProducts().then((result) => {
      if (result.ok) setProducts(result.data)
    })
  }, [])

  useEffect(() => {
    void dataLayer.repos.marketplace.listListings().then((result) => {
      if (!result.ok) return
      setListings(result.data.filter((l) => favoriteIds.includes(l.id)))
    })
  }, [favoriteIds])

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('savedFavourites')} ({favoriteIds.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {listings.length === 0 ? (
          <EmptyState title={t('noFavouritesYet')} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {listings.map((listing) => {
              const product = productMap.get(listing.productId)
              const productTitle = product ? pickName(product) : listing.productId
              return (
                <ListingProductCard
                  key={listing.id}
                  size="sm"
                  accentBorder={false}
                  title={productTitle}
                  imageUrl={product?.imageUrl}
                  imageAlt={productTitle}
                  contentClassName="text-sm"
                >
                  {t('availableLabel')}: {listing.availableQuantity}
                </ListingProductCard>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
