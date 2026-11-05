import { useI18n } from '@/app/preferences/LocaleProvider'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAppSelector } from '@/app/store/hooks'
import { selectAuthSession } from '@/features/auth/authSlice'
import {
  cancelTransaction,
  confirmTransactionSide,
  submitBid,
} from '@/features/marketplace/marketplaceService'
import { ListingsBrowsePanel, useFavoriteListingIds } from '@/features/marketplace/ListingsBrowsePanel'
import { dataLayer } from '@/data'
import type { Bid, Listing, Product, Transaction } from '@/types/domain/records'
import { statusLabel } from '@/lib/i18n/userFacingText'
import { ListingProductCard } from '@/features/marketplace/ListingProductCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function BuyerMarketplacePage() {
  const { t, locale, translateError } = useI18n()
  const session = useAppSelector(selectAuthSession)
  const { favoriteIds, setFavoriteIds } = useFavoriteListingIds()
  const [bids, setBids] = useState<Bid[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [offerListing, setOfferListing] = useState<Listing | null>(null)
  const [offerQty, setOfferQty] = useState('10')
  const [offerPrice, setOfferPrice] = useState('35')

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

  return (
    <div className="space-y-4">
      <Badge variant="secondary">{t('buyerBadge')}</Badge>
      <h1 className="text-2xl font-semibold">{t('buyerTitle')}</h1>

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse">{t('tabBrowse')}</TabsTrigger>
          <TabsTrigger value="bids">{t('tabBids')}</TabsTrigger>
          <TabsTrigger value="favourites">{t('tabFavourites')}</TabsTrigger>
        </TabsList>
        <TabsContent value="browse">
          <ListingsBrowsePanel
            userId={session.userId}
            canBid
            canFavorite
            favoriteIds={favoriteIds}
            onFavoritesChange={setFavoriteIds}
            onBid={(listing) => {
              setOfferListing(listing)
              setOfferPrice(String(listing.askingPricePerUnit))
            }}
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

      <Dialog open={Boolean(offerListing)} onOpenChange={(open) => !open && setOfferListing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('submitBidTitle')}</DialogTitle>
          </DialogHeader>
          {offerListing ? (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault()
                void submitBid({
                  buyerUserId: session.userId,
                  listingId: offerListing.id,
                  quantity: Number(offerQty),
                  offeredPricePerUnit: Number(offerPrice),
                }).then((result) => {
                  if (!result.ok) return toast.error(translateError(result.error.message))
                  toast.success(t('offerSubmitted'))
                  setOfferListing(null)
                  reload()
                })
              }}
            >
              <div className="space-y-1">
                <Label>{t('quantity')}</Label>
                <Input value={offerQty} onChange={(e) => setOfferQty(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>{t('offerPriceUnit')}</Label>
                <Input value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">
                {t('sendOffer')}
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FavouritesPanel({ favoriteIds }: { favoriteIds: string[] }) {
  const { t, pickName } = useI18n()
  const [listings, setListings] = useState<Listing[]>([])
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
          <p className="text-sm text-bazardor-muted">{t('noFavouritesYet')}</p>
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
