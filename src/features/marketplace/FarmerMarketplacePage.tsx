import { useI18n } from '@/app/preferences/LocaleProvider'
import { statusLabel } from '@/lib/i18n/userFacingText'
import { ProductCombobox } from '@/components/common/ProductCombobox'
import { ListingProductCard } from '@/features/marketplace/ListingProductCard'
import { BangladeshLocationSelector } from '@/components/common/BangladeshLocationSelector'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'
import { leafLocationId, type BangladeshLocationSelection } from '@/data/bangladeshLocationIndex'
import { validateLocationSelection } from '@/services/bangladeshLocationValidation'
import { Mic } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAppSelector } from '@/app/store/hooks'
import { selectAuthSession } from '@/features/auth/authSlice'
import { createFarmerPriceEntry, createListing, restockListing } from '@/features/marketplace/marketplaceService'
import { ListingsBrowsePanel } from '@/features/marketplace/ListingsBrowsePanel'
import { dataLayer } from '@/data'
import type { Listing, PriceEntry, Product } from '@/types/domain/records'
import { MetricTileGrid } from '@/components/common/MetricTileGrid'
import { RoleWorkspaceShell } from '@/components/common/RoleWorkspaceShell'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type CatalogOption = {
  products: { id: string; nameEn: string; nameBn?: string }[]
  locations: { id: string; nameEn: string }[]
  units: { id: string; code: string; nameEn: string; nameBn: string }[]
}

export function FarmerMarketplacePage() {
  const { t, formatNumber } = useI18n()
  const session = useAppSelector(selectAuthSession)
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [myPrices, setMyPrices] = useState<PriceEntry[]>([])

  const loadMine = useCallback(() => {
    if (!session) return
    void dataLayer.repos.marketplace.listListings().then((result) => {
      if (result.ok) setMyListings(result.data.filter((l) => l.sellerUserId === session.userId))
    })
    void dataLayer.repos.prices.listPriceEntries().then((result) => {
      if (result.ok) setMyPrices(result.data.filter((p) => p.farmerId === session.userId))
    })
  }, [session])

  useEffect(() => {
    loadMine()
  }, [loadMine])

  if (!session) return null

  return (
    <RoleWorkspaceShell role="farmer" eyebrow={t('farmerBadge')} title={t('farmerTitle')}>
      <Tabs defaultValue="overview">
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">{t('tabOverview')}</TabsTrigger>
          <TabsTrigger value="browse">{t('tabBrowse')}</TabsTrigger>
          <TabsTrigger value="listings">{t('tabListings')}</TabsTrigger>
          <TabsTrigger value="prices">{t('tabPrices')}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <MetricTileGrid
            metrics={[
              { label: t('myListings'), value: formatNumber(myListings.length, 0) },
              { label: t('tabPrices'), value: formatNumber(myPrices.length, 0) },
            ]}
          />
          <p className="text-sm text-muted-foreground">{t('overviewHint')}</p>
        </TabsContent>
        <TabsContent value="browse">
          <ListingsBrowsePanel userId={session.userId} />
        </TabsContent>
        <TabsContent value="listings" className="space-y-4">
          <ListingCreateCard userId={session.userId} onCreated={loadMine} />
          <ListingHistoryCards rows={myListings} sellerUserId={session.userId} onUpdated={loadMine} />
        </TabsContent>
        <TabsContent value="prices" className="space-y-4">
          <PriceEntryCard farmerId={session.userId} onCreated={loadMine} />
          <PriceHistoryCards rows={myPrices} />
        </TabsContent>
      </Tabs>
    </RoleWorkspaceShell>
  )
}

const defaultFarmerLocation = (): BangladeshLocationSelection => ({
  divisionId: D.divisionKhulna,
  districtId: D.districtJashore,
  upazilaId: D.upazilaKeshabpur,
  unionId: D.unionGhona,
})

function useCatalogOptions() {
  const [catalog, setCatalog] = useState<CatalogOption>({ products: [], locations: [], units: [] })
  useEffect(() => {
    void Promise.all([
      dataLayer.repos.catalog.listProducts(),
      dataLayer.repos.catalog.listLocations(),
      dataLayer.repos.catalog.listUnits(),
    ]).then(([p, l, u]) => {
      if (!p.ok || !l.ok || !u.ok) return
      setCatalog({
        products: p.data.map((row) => ({ id: row.id, nameEn: row.nameEn, nameBn: row.nameBn })),
        locations: l.data.map((row) => ({ id: row.id, nameEn: row.nameEn })),
        units: u.data.map((row) => ({
          id: row.id,
          code: row.code,
          nameEn: row.nameEn,
          nameBn: row.nameBn,
        })),
      })
    })
  }, [])
  return catalog
}

function useProductMap() {
  const [products, setProducts] = useState<Product[]>([])
  useEffect(() => {
    void dataLayer.repos.catalog.listProducts().then((result) => {
      if (result.ok) setProducts(result.data)
    })
  }, [])
  return useMemo(() => new Map(products.map((p) => [p.id, p])), [products])
}

function ListingCreateCard({ userId, onCreated }: { userId: string; onCreated: () => void }) {
  const { t, translateError, formatUnitLabel } = useI18n()
  const catalog = useCatalogOptions()
  const [productId, setProductId] = useState('')
  const [locationSel, setLocationSel] = useState<BangladeshLocationSelection>(defaultFarmerLocation)
  const [unitId, setUnitId] = useState('')
  const [quantity, setQuantity] = useState('100')
  const [price, setPrice] = useState('40')

  useEffect(() => {
    setProductId(catalog.products[0]?.id ?? '')
    setUnitId(catalog.units[0]?.id ?? '')
  }, [catalog])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('createListing')}</CardTitle>
        <CardDescription>{t('listingAskingDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault()
            const validation = validateLocationSelection(locationSel)
            if (!validation.ok) return toast.error(translateError(validation.message))
            const locationId = leafLocationId(locationSel)
            if (!locationId) return toast.error(translateError('locationValidationDivisionRequired'))
            void createListing({
              sellerUserId: userId,
              productId,
              locationId,
              unitId,
              quantity: Number(quantity),
              askingPricePerUnit: Number(price),
            }).then((result) => {
              if (!result.ok) return toast.error(translateError(result.error.message))
              toast.success(t('listingCreated'))
              onCreated()
            })
          }}
        >
          <ProductCombobox
            label={t('product')}
            products={catalog.products}
            value={productId}
            onChange={setProductId}
          />
          <div className="md:col-span-2">
            <BangladeshLocationSelector value={locationSel} onChange={setLocationSel} required unionRequired />
          </div>
          <SelectField
            label={t('unit')}
            value={unitId}
            onChange={setUnitId}
            options={catalog.units.map((u) => ({ id: u.id, label: formatUnitLabel(u) }))}
          />
          <div className="space-y-1">
            <Label>{t('quantity')}</Label>
            <Input value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{t('offerPriceUnit')}</Label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <Button type="submit" className="md:col-span-2">
            {t('publishDemoListing')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function PriceEntryCard({ farmerId, onCreated }: { farmerId: string; onCreated: () => void }) {
  const { t, translateError, formatUnitLabel, locale } = useI18n()
  const catalog = useCatalogOptions()
  const [productId, setProductId] = useState('')
  const [locationSel, setLocationSel] = useState<BangladeshLocationSelection>(defaultFarmerLocation)
  const [unitId, setUnitId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [totalPrice, setTotalPrice] = useState('3200')

  useEffect(() => {
    setProductId(catalog.products[0]?.id ?? '')
    setUnitId(catalog.units[0]?.id ?? '')
  }, [catalog])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('marketPriceObservation')}</CardTitle>
        <CardDescription>{t('priceObservationDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault()
            const validation = validateLocationSelection(locationSel)
            if (!validation.ok) return toast.error(translateError(validation.message))
            const locationId = leafLocationId(locationSel)
            if (!locationId) return toast.error(translateError('locationValidationDivisionRequired'))
            void createFarmerPriceEntry({
              farmerId,
              productId,
              locationId,
              reportedUnitId: unitId,
              reportedQuantity: Number(quantity),
              reportedTotalPrice: Number(totalPrice),
            }).then((result) => {
              if (!result.ok) return toast.error(translateError(result.error.message))
              toast.success(
                `${t('priceSaved')} — ${t('status')}: ${statusLabel(locale, 'consentStatus', result.data.consentStatus)}`,
              )
              onCreated();
            });
          }}
        >
          <ProductCombobox
            label={t('product')}
            products={catalog.products}
            value={productId}
            onChange={setProductId}
          />
          <div className="md:col-span-2">
            <BangladeshLocationSelector value={locationSel} onChange={setLocationSel} required unionRequired />
          </div>
          <SelectField
            label={t('unit')}
            value={unitId}
            onChange={setUnitId}
            options={catalog.units.map((u) => ({ id: u.id, label: formatUnitLabel(u) }))}
          />
          <div className="space-y-1">
            <Label>{t('quantity')}</Label>
            <Input value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{t('totalPrice')}</Label>
            <Input value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} />
          </div>
          <Button type="submit" className="md:col-span-2">
            {t('saveObservation')}
          </Button>
          <Button type="button" variant="outline" className="md:col-span-2 gap-2" disabled title={t('voiceComingSoon')}>
            <Mic className="size-4" aria-hidden />
            {t('voiceComingSoon')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { id: string; label: string }[]
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Select value={value} onValueChange={(next) => onChange(next ?? '')}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function ListingHistoryCards({
  rows,
  sellerUserId,
  onUpdated,
}: {
  rows: Listing[]
  sellerUserId: string
  onUpdated: () => void
}) {
  const { t, pickName, formatNumber, locale, translateError } = useI18n()
  const productMap = useProductMap()
  const [restockById, setRestockById] = useState<Record<string, string>>({})

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('listingHistoryTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState title={t('noListings')} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => {
              const product = productMap.get(row.productId)
              const productTitle = product ? pickName(product) : row.productId
              return (
                <ListingProductCard
                  key={row.id}
                  size="sm"
                  accentBorder={false}
                  title={productTitle}
                  imageUrl={product?.imageUrl}
                  imageAlt={productTitle}
                  contentClassName="space-y-2 text-sm"
                >
                    <p>
                      {t('available')}: {formatNumber(row.availableQuantity, 0)}
                    </p>
                    <p>
                      {t('reserved')}: {formatNumber(row.reservedQuantity, 0)}
                    </p>
                    <p>
                      {t('status')}: {statusLabel(locale, 'listingStatus', row.status)}
                    </p>
                    <div className="space-y-1">
                      <Label className="text-xs">{t('restockAmount')}</Label>
                      <Input
                        value={restockById[row.id] ?? ''}
                        onChange={(e) =>
                          setRestockById((prev) => ({ ...prev, [row.id]: e.target.value }))
                        }
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const qty = Number(restockById[row.id])
                          void restockListing({
                            sellerUserId,
                            listingId: row.id,
                            additionalQuantity: qty,
                          }).then((result) => {
                            if (!result.ok) return toast.error(translateError(result.error.message))
                            toast.success(t('restockSuccess'))
                            onUpdated()
                          })
                        }}
                      >
                        {t('restockSubmit')}
                      </Button>
                    </div>
                </ListingProductCard>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PriceHistoryCards({ rows }: { rows: PriceEntry[] }) {
  const { t, pickName, formatNumber, locale } = useI18n()
  const productMap = useProductMap()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('priceHistoryTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState title={t('insufficientData')} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => {
              const product = productMap.get(row.productId)
              const productTitle = product ? pickName(product) : row.productId
              return (
                <ListingProductCard
                  key={row.id}
                  size="sm"
                  accentBorder={false}
                  title={productTitle}
                  imageUrl={product?.imageUrl}
                  imageAlt={productTitle}
                  contentClassName="space-y-1 text-sm"
                >
                    <p>
                      {t('perKg')}: {formatNumber(row.normalizedPricePerKg, 2)}
                    </p>
                    <p>
                      {t('status')}: {statusLabel(locale, 'approvalStatus', row.approvalStatus)}
                    </p>
                </ListingProductCard>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
