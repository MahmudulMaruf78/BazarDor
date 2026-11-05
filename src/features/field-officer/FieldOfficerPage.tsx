import { ListingProductCard } from '@/features/marketplace/ListingProductCard'
import { BangladeshLocationSelector } from '@/components/common/BangladeshLocationSelector'
import { ProductCombobox } from '@/components/common/ProductCombobox'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'
import {
  leafLocationId,
  type BangladeshLocationSelection,
} from '@/data/bangladeshLocationIndex'
import { validateLocationSelection } from '@/services/bangladeshLocationValidation'
import { statusLabel } from '@/lib/i18n/userFacingText'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
import { useAppSelector } from '@/app/store/hooks'
import { selectAuthSession } from '@/features/auth/authSlice'
import {
  approveVerificationEntry,
  assignedAreaLabel,
  createAssistedPriceEntry,
  listAssignedFarmers,
  listAuditTrailForEntry,
  listVerificationQueue,
  lookupFarmerByQrProfileId,
  registerAssistedFarmer,
  rejectVerificationEntry,
  verifyDemoConsent,
} from '@/features/field-officer/fieldOfficerService'
import {
  listSyncQueueItems,
  mockSyncQueue,
  queueDraftForSync,
  saveOfflineDraft,
} from '@/features/field-officer/offlineSyncService'
import type { AuditLogEntry, FarmerProfile, Location, PriceEntry, Product, SyncQueueItem } from '@/types/domain/records'
import { dataLayer } from '@/data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function FieldOfficerPage() {
  const { t, translateError, locale, pickName, formatNumber } = useI18n()
  const session = useAppSelector(selectAuthSession)
  const [farmers, setFarmers] = useState<Array<FarmerProfile & { displayName: string }>>([])
  const [queue, setQueue] = useState<PriceEntry[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [syncItems, setSyncItems] = useState<SyncQueueItem[]>([])
  const [selectedFarmerId, setSelectedFarmerId] = useState('')
  const [selectedEntryId, setSelectedEntryId] = useState('')
  const [audit, setAudit] = useState<AuditLogEntry[]>([])
  const [rejectReason, setRejectReason] = useState('')
  const [search, setSearch] = useState('')
  const [qrProfileId, setQrProfileId] = useState('')
  const [scanInput, setScanInput] = useState('')
  const [scanMatchName, setScanMatchName] = useState('')

  const reload = useCallback(() => {
    void listAssignedFarmers().then((result) => {
      if (result.ok) {
        setFarmers(result.data)
        setSelectedFarmerId((prev) => prev || result.data[0]?.userId || '')
        setQrProfileId((prev) => prev || result.data[0]?.qrProfileId || '')
      }
    })
    void listVerificationQueue().then((result) => result.ok && setQueue(result.data))
    void listSyncQueueItems().then((result) => result.ok && setSyncItems(result.data))
  }, [])

  useEffect(() => {
    reload()
  }, [session?.userId, reload])

  useEffect(() => {
    void Promise.all([
      dataLayer.repos.catalog.listProducts(),
      dataLayer.repos.catalog.listLocations(),
    ]).then(([productsResult, locationsResult]) => {
      if (productsResult.ok) setProducts(productsResult.data)
      if (locationsResult.ok) setLocations(locationsResult.data)
    })
  }, [])

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])
  const locationMap = useMemo(() => new Map(locations.map((l) => [l.id, l])), [locations])

  const filteredFarmers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return farmers
    return farmers.filter(
      (f) => f.displayName.toLowerCase().includes(q) || f.displayNameBn.includes(search.trim()),
    )
  }, [farmers, search])

  if (!session) return null

  return (
    <div className="space-y-4">
      <Badge variant="secondary">{t('foBadge')}</Badge>
      <h1 className="text-2xl font-semibold">{t('foTitle')}</h1>
      <p className="text-sm text-bazardor-muted">
        {assignedAreaLabel()} — {t('foAssignment')}
      </p>

      <Tabs defaultValue="farmers">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="farmers">{t('tabFarmers')}</TabsTrigger>
          <TabsTrigger value="assisted">{t('tabAssisted')}</TabsTrigger>
          <TabsTrigger value="consent">{t('tabConsent')}</TabsTrigger>
          <TabsTrigger value="verify">{t('tabVerify')}</TabsTrigger>
          <TabsTrigger value="offline">{t('tabOffline')}</TabsTrigger>
          <TabsTrigger value="qr">{t('tabQr')}</TabsTrigger>
        </TabsList>

        <TabsContent value="farmers">
          <AssistedFarmerRegistrationForm officerUserId={session.userId} onRegistered={reload} />
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>{t('farmerSearch')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder={t('searchFarmers')} value={search} onChange={(e) => setSearch(e.target.value)} />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('phone')}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFarmers.map((farmer) => (
                    <TableRow key={farmer.id}>
                      <TableCell>{farmer.displayName}</TableCell>
                      <TableCell>{farmer.hasPhone ? t('demoPhoneOnFile') : t('noPhone')}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectedFarmerId(farmer.userId)
                            setQrProfileId(farmer.qrProfileId)
                          }}
                        >
                          {t('select')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assisted">
          <AssistedEntryForm
            officerUserId={session.userId}
            farmerUserId={selectedFarmerId}
            farmerHasPhone={farmers.find((f) => f.userId === selectedFarmerId)?.hasPhone}
            products={products}
            onSaved={reload}
          />
        </TabsContent>

        <TabsContent value="consent">
          <Card>
            <CardHeader>
              <CardTitle>{t('demoConsentOtp')}</CardTitle>
              <CardDescription>{t('demoConsentDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label htmlFor="consent-entry">{t('pendingEntryId')}</Label>
              <Input id="consent-entry" value={selectedEntryId} onChange={(e) => setSelectedEntryId(e.target.value)} />
              <Button
                type="button"
                onClick={() => {
                  if (!selectedEntryId) return
                  void verifyDemoConsent(selectedEntryId, session.userId).then((result) => {
                    if (!result.ok) return toast.error(translateError(result.error.message))
                    toast.success(t('consentVerified'))
                    reload()
                  })
                }}
              >
                {t('markOtpVerified')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('verifyQueue')}</CardTitle>
              <CardDescription>{t('verifyQueueDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {queue.length === 0 ? (
                <p className="text-sm text-bazardor-muted">{t('insufficientData')}</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {queue.map((entry) => {
                    const product = productMap.get(entry.productId)
                    const location = locationMap.get(entry.locationId)
                    const productTitle = product ? pickName(product) : entry.productId
                    return (
                      <ListingProductCard
                        key={entry.id}
                        title={productTitle}
                        imageUrl={product?.imageUrl}
                        imageAlt={productTitle}
                        description={location ? pickName(location) : undefined}
                        contentClassName="space-y-2 text-sm"
                      >
                        <p className="font-mono text-xs text-muted-foreground">{entry.id}</p>
                          <p>
                            {t('perKg')}: {formatNumber(entry.normalizedPricePerKg, 2)}
                          </p>
                          <p>
                            {t('status')}: {statusLabel(locale, 'consentStatus', entry.consentStatus)} ·{' '}
                            {statusLabel(locale, 'approvalStatus', entry.approvalStatus)}
                          </p>
                          <p className="text-bazardor-muted text-xs">
                            {entry.farmerId} · {entry.submittedByUserId}
                          </p>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <Button
                              size="sm"
                              type="button"
                              onClick={() => {
                                void approveVerificationEntry(entry.id, session.userId).then((result) => {
                                  if (!result.ok) return toast.error(translateError(result.error.message))
                                  toast.success(t('approvedToast'))
                                  reload()
                                })
                              }}
                            >
                              {t('approve')}
                            </Button>
                            <Button
                              size="sm"
                              type="button"
                              variant="outline"
                              onClick={() => {
                                void rejectVerificationEntry(
                                  entry.id,
                                  session.userId,
                                  rejectReason || t('demoRejectionDefault'),
                                ).then((result) => {
                                  if (!result.ok) return toast.error(translateError(result.error.message))
                                  toast.message(t('rejectedToast'))
                                  reload()
                                })
                              }}
                            >
                              {t('rejectLabel')}
                            </Button>
                            <Button
                              size="sm"
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                setSelectedEntryId(entry.id)
                                void listAuditTrailForEntry(entry.id).then(
                                  (result) => result.ok && setAudit(result.data),
                                )
                              }}
                            >
                              {t('audit')}
                            </Button>
                          </div>
                      </ListingProductCard>
                    )
                  })}
                </div>
              )}
              <Input
                placeholder={t('rejectionReasonPh')}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </CardContent>
          </Card>
          {audit.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('auditTrailTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {audit.map((log) => (
                    <li key={log.id}>
                      {log.at} — {log.action} by {log.actorUserId}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="offline">
          <Card>
            <CardHeader>
              <CardTitle>{t('offlineQueue')}</CardTitle>
              <CardDescription>{t('offlineDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  void saveOfflineDraft({ note: 'Offline assisted draft', farmerId: selectedFarmerId }).then((result) => {
                    if (!result.ok) return toast.error(translateError(result.error.message))
                    toast.success(t('draftSavedOffline'))
                    reload()
                  })
                }}
              >
                {t('saveDraft')}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const draft = syncItems.find((item) => item.status === 'DRAFT')
                  if (!draft) return toast.message(t('noDraftInQueue'))
                  void queueDraftForSync(draft.clientEntryId).then((result) => {
                    if (!result.ok) return toast.error(translateError(result.error.message))
                    reload()
                  })
                }}
              >
                {t('queueSync')}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  void mockSyncQueue().then((result) => {
                    if (!result.ok) return toast.error(translateError(result.error.message))
                    toast.success(t('mockSyncFinished'))
                    reload()
                  })
                }}
              >
                {t('runMockSync')}
              </Button>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('clientIdLabel')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('errorLabel')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncItems.map((item) => (
                    <TableRow key={item.clientEntryId}>
                      <TableCell className="font-mono text-xs">{item.clientEntryId}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell className="text-xs text-bazardor-muted">{item.errorDetail ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr">
          <Card>
            <CardHeader>
              <CardTitle>{t('qrProfile')}</CardTitle>
              <CardDescription>{t('qrDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-4">
              <Input value={qrProfileId} onChange={(e) => setQrProfileId(e.target.value)} />
              {qrProfileId ? <QRCodeSVG value={qrProfileId} size={160} /> : null}
              <p className="text-xs text-bazardor-muted">
                {t('qrPayloadHint')}: {qrProfileId || t('selectFarmerQr')}
              </p>
              <div className="w-full max-w-md space-y-2 border-t pt-4">
                <Label htmlFor="qr-scan">{t('scanQrTitle')}</Label>
                <p className="text-xs text-bazardor-muted">{t('scanQrDesc')}</p>
                <Input
                  id="qr-scan"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder={t('selectFarmerQr')}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    void lookupFarmerByQrProfileId(scanInput).then((result) => {
                      if (!result.ok) {
                        setScanMatchName('')
                        return toast.error(translateError(result.error.message))
                      }
                      setSelectedFarmerId(result.data.userId)
                      setQrProfileId(result.data.qrProfileId)
                      setScanMatchName(result.data.displayName)
                      toast.success(`${t('scanQrMatch')}: ${result.data.displayName}`)
                    })
                  }}
                >
                  {t('scanQrSubmit')}
                </Button>
                {scanMatchName ? (
                  <p className="text-sm">
                    {t('scanQrMatch')}: {scanMatchName}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const demoLocationSelection = (): BangladeshLocationSelection => ({
  divisionId: D.divisionKhulna,
  districtId: D.districtJashore,
  upazilaId: D.upazilaKeshabpur,
})

function AssistedFarmerRegistrationForm({
  officerUserId,
  onRegistered,
}: {
  officerUserId: string
  onRegistered: () => void
}) {
  const { t, translateError } = useI18n()
  const [displayName, setDisplayName] = useState('')
  const [displayNameBn, setDisplayNameBn] = useState('')
  const [locationSel, setLocationSel] = useState<BangladeshLocationSelection>(demoLocationSelection)
  const [hasPhone, setHasPhone] = useState(true)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('registerFarmerTitle')}</CardTitle>
        <CardDescription>{t('registerFarmerDesc')}</CardDescription>
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
            void registerAssistedFarmer({
              officerUserId,
              displayName,
              displayNameBn,
              locationId,
              divisionId: locationSel.divisionId,
              districtId: locationSel.districtId,
              upazilaId: locationSel.upazilaId,
              unionId: locationSel.unionId,
              hasPhone,
            }).then((result) => {
              if (!result.ok) return toast.error(translateError(result.error.message))
              toast.success(t('farmerRegistered'))
              setDisplayName('')
              setDisplayNameBn('')
              onRegistered()
            })
          }}
        >
          <div className="space-y-1">
            <Label>{t('farmerNameEn')}</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>{t('farmerNameBn')}</Label>
            <Input value={displayNameBn} onChange={(e) => setDisplayNameBn(e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <BangladeshLocationSelector value={locationSel} onChange={setLocationSel} required />
          </div>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={hasPhone}
              onChange={(e) => setHasPhone(e.target.checked)}
              className="size-4 rounded border"
            />
            {t('farmerHasPhone')}
          </label>
          <Button type="submit" className="md:col-span-2">
            {t('registerFarmerSubmit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function AssistedEntryForm({
  officerUserId,
  farmerUserId,
  farmerHasPhone,
  products,
  onSaved,
}: {
  officerUserId: string
  farmerUserId: string
  farmerHasPhone?: boolean
  products: readonly Product[]
  onSaved: () => void
}) {
  const { t, translateError, locale } = useI18n()
  const [productId, setProductId] = useState('prod-paddy')
  const [locationSel, setLocationSel] = useState<BangladeshLocationSelection>(demoLocationSelection)
  const [unitId, setUnitId] = useState('unit-maund')
  const [quantity, setQuantity] = useState('1')
  const [totalPrice, setTotalPrice] = useState('3200')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('assistedEntry')}</CardTitle>
        <CardDescription>
          {t('assistedLinks')}
          {farmerHasPhone === false ? (
            <span className="mt-1 block text-amber-800">{t('consentNotAvailable')}</span>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault()
            if (!farmerUserId) return toast.error(t('selectFarmerFirst'))
            const validation = validateLocationSelection(locationSel)
            if (!validation.ok) return toast.error(translateError(validation.message))
            const locationId = leafLocationId(locationSel)
            if (!locationId) return toast.error(translateError('locationValidationDivisionRequired'))
            void createAssistedPriceEntry({
              officerUserId,
              farmerId: farmerUserId,
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
              onSaved()
            })
          }}
        >
          <ProductCombobox
            className="md:col-span-2"
            label={t('product')}
            products={products}
            value={productId}
            onChange={setProductId}
          />
          <div className="md:col-span-2">
            <BangladeshLocationSelector value={locationSel} onChange={setLocationSel} required />
          </div>
          <div className="space-y-1">
            <Label>{t('unit')}</Label>
            <Input value={unitId} onChange={(e) => setUnitId(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{t('quantity')}</Label>
            <Input value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{t('totalPrice')}</Label>
            <Input value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} />
          </div>
          <Button type="submit" className="md:col-span-2">
            {t('submitAssisted')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
