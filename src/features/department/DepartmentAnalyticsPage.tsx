import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useI18n } from '@/app/preferences/LocaleProvider'
import {
  defaultDepartmentFilters,
  exportPdfBlob,
  exportWorkbookCsvBlob,
  exportWorkbookXlsxBlob,
  fetchActivitySummary,
  fetchOfficialAverage,
  fetchRegionalComparison,
  fetchTrend,
  hasMapGeometry,
  loadDepartmentCatalog,
  regionalMapDots,
  scopeLabel,
  type ActivitySummary,
  type DepartmentFilters,
  type RegionalRow,
  type TrendGranularity,
  type TrendPoint,
} from '@/features/department/departmentAnalyticsService'
import type { OfficialAverageResult } from '@/services/types'
import type { Location, Product } from '@/types/domain/records'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BangladeshLocationSelector } from '@/components/common/BangladeshLocationSelector'
import { ProductCombobox } from '@/components/common/ProductCombobox'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'
import {
  deepestScopeLocationId,
  selectionFromLocationId,
  type BangladeshLocationSelection,
} from '@/data/bangladeshLocationIndex'
import { sanitizeBangladeshLocationSelection } from '@/services/bangladeshLocationValidation'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

const SCOPE_PRESET_KEYS = [
  { key: 'scopeNationalKhulna' as const, scopeId: D.divisionKhulna },
  { key: 'scopeDistrictJashore' as const, scopeId: D.districtJashore },
  { key: 'scopeUpazilaKeshabpur' as const, scopeId: D.upazilaKeshabpur },
]

export function DepartmentAnalyticsPage() {
  const { t, formatNumber, pickName } = useI18n()
  const [filters, setFilters] = useState<DepartmentFilters>(defaultDepartmentFilters())
  const [locationSel, setLocationSel] = useState<BangladeshLocationSelection>(() =>
    sanitizeBangladeshLocationSelection(
      selectionFromLocationId(defaultDepartmentFilters().locationScopeId) ?? {
        divisionId: D.divisionKhulna,
        districtId: D.districtJashore,
      },
    ),
  )
  const [trendGranularity, setTrendGranularity] = useState<TrendGranularity>('week')
  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [average, setAverage] = useState<OfficialAverageResult | null>(null)
  const [trend, setTrend] = useState<TrendPoint[]>([])
  const [regional, setRegional] = useState<RegionalRow[]>([])
  const [activity, setActivity] = useState<ActivitySummary | null>(null)

  const reload = (next: DepartmentFilters = filters, granularity: TrendGranularity = trendGranularity) => {
    void fetchOfficialAverage(next).then((result) => result.ok && setAverage(result.data))
    void fetchTrend(next, granularity).then((result) => result.ok && setTrend(result.data))
    void fetchRegionalComparison(next, D.districtJashore).then((result) => result.ok && setRegional(result.data))
    void fetchActivitySummary().then((result) => result.ok && setActivity(result.data))
  }

  useEffect(() => {
    void loadDepartmentCatalog().then((result) => {
      if (!result.ok) return
      setProducts(result.data.products)
      setLocations(result.data.locations)
    })
    reload()
  }, [])

  const mapDots = useMemo(() => regionalMapDots(locations, regional), [locations, regional])

  const scopeLocation = locations.find((loc) => loc.id === filters.locationScopeId)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('deptBadge')}
        title={t('deptTitle')}
        subtitle={t('deptSubtitle')}
        role="department"
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('filters')}</CardTitle>
          <CardDescription>{t('officialAvgDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-wrap gap-2 md:col-span-2">
            {SCOPE_PRESET_KEYS.map((preset) => (
              <Button
                key={preset.scopeId}
                type="button"
                size="sm"
                variant={filters.locationScopeId === preset.scopeId ? 'default' : 'outline'}
                onClick={() => {
                  const scopeId = preset.scopeId
                  setFilters((prev) => ({ ...prev, locationScopeId: scopeId }))
                  setLocationSel(
                    sanitizeBangladeshLocationSelection(
                      selectionFromLocationId(scopeId) ?? { divisionId: D.divisionKhulna },
                    ),
                  )
                }}
              >
                {t(preset.key)}
              </Button>
            ))}
          </div>
          <ProductCombobox
            label={t('product')}
            products={products}
            value={filters.productId}
            onChange={(productId) => setFilters((prev) => ({ ...prev, productId }))}
          />
          <div className="space-y-1 md:col-span-2">
            <Label>{t('locationScope')}</Label>
            <BangladeshLocationSelector
              value={locationSel}
              onChange={(sel) => {
                const next = sanitizeBangladeshLocationSelection(sel)
                setLocationSel(next)
                setFilters((prev) => ({ ...prev, locationScopeId: deepestScopeLocationId(next) }))
              }}
            />
          </div>
          <div className="space-y-1">
            <Label>{t('trendGranularity')}</Label>
            <Select
              value={trendGranularity}
              onValueChange={(value) => value && setTrendGranularity(value as TrendGranularity)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">{t('trendDaily')}</SelectItem>
                <SelectItem value="week">{t('trendWeekly')}</SelectItem>
                <SelectItem value="month">{t('trendMonthly')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>{t('windowStart')}</Label>
            <Input
              value={filters.windowStart}
              onChange={(e) => setFilters((prev) => ({ ...prev, windowStart: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>{t('windowEnd')}</Label>
            <Input
              value={filters.windowEnd}
              onChange={(e) => setFilters((prev) => ({ ...prev, windowEnd: e.target.value }))}
            />
          </div>
          <Button
            type="button"
            className="md:col-span-2"
            onClick={() => {
              const next = { ...filters, calculatedAt: new Date().toISOString() }
              setFilters(next)
              reload(next, trendGranularity)
            }}
          >
            {t('applyFilters')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('officialMarketAvg')}</CardTitle>
          <CardDescription>
            {scopeLocation ? pickName(scopeLocation) : scopeLabel(locations, filters.locationScopeId)} ·{' '}
            {t('calculated')}: {filters.calculatedAt.slice(0, 19)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!average ? (
            <p className="text-sm text-bazardor-muted">{t('loading')}</p>
          ) : average.status === 'calculated' ? (
            <div className="space-y-1">
              <p className="text-3xl font-semibold">{formatNumber(average.averagePricePerKg)} BDT/kg</p>
              <p className="text-sm text-bazardor-muted">
                {formatNumber(average.sampleCount, 0)} {t('farmerSamples')} ·{' '}
                {average.windowStart.slice(0, 10)} → {average.windowEnd.slice(0, 10)}
              </p>
            </div>
          ) : (
            <p className="text-lg font-medium">
              {t('insufficientData')} · {average.sampleCount} · {average.distinctFarmerCount}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('priceTrend')}</CardTitle>
            <CardDescription>{t('priceTrendDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('period')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('avgKg')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trend.map((point) => (
                  <TableRow key={point.label}>
                    <TableCell>{point.label.split(':').pop()}</TableCell>
                    <TableCell>{point.result.status}</TableCell>
                    <TableCell>
                      {point.result.status === 'calculated' ? formatNumber(point.result.averagePricePerKg) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('regionalComparison')}</CardTitle>
            <CardDescription>{t('regionalDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('region')}</TableHead>
                  <TableHead>{t('samples')}</TableHead>
                  <TableHead>{t('avgKg')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regional.map((row) => {
                  const loc = locations.find((l) => l.id === row.locationId)
                  return (
                  <TableRow key={row.locationId}>
                    <TableCell>{loc ? pickName(loc) : row.locationName}</TableCell>
                    <TableCell>{row.result.sampleCount}</TableCell>
                    <TableCell>
                      {row.result.status === 'calculated'
                        ? formatNumber(row.result.averagePricePerKg)
                        : t('insufficient')}
                    </TableCell>
                  </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {hasMapGeometry(locations) && mapDots.length > 0 ? (
              <div>
                <p className="mb-2 text-xs text-bazardor-muted">{t('demoHeatmap')}</p>
                <svg viewBox="0 0 100 100" className="h-40 w-full rounded-md border bg-muted/30" role="img" aria-label="Demo regional sample heatmap">
                  {mapDots.map((dot) => (
                    <g key={dot.id}>
                      <circle
                        cx={dot.x}
                        cy={dot.y}
                        r={Math.max(4, Math.min(16, dot.samples * 3))}
                        className="fill-bazardor-green/50 stroke-bazardor-green"
                      />
                      <title>{`${dot.name}: ${dot.samples} samples`}</title>
                    </g>
                  ))}
                </svg>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('marketplaceActivity')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6 text-sm">
          <span>
            {t('activeListings')}: {activity?.activeListings ?? '…'}
          </span>
          <span>
            {t('demoTransactions')}: {activity?.demoTransactions ?? '…'}
          </span>
          <span>
            {t('approvedPriceObs')}: {activity?.approvedPriceEntries ?? '…'}
          </span>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            if (!average) return
            void exportWorkbookCsvBlob(filters, average, regional).then((blob) => {
              downloadBlob(blob, 'bazardor-demo-export.csv')
              toast.success(t('exportCsv'))
            })
          }}
        >
          {t('exportCsv')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            if (!average) return
            void exportWorkbookXlsxBlob(filters, average, regional).then((blob) => {
              downloadBlob(blob, 'bazardor-demo-export.xlsx')
              toast.success(t('exportExcel'))
            })
          }}
        >
          {t('exportExcel')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (!average) return
            void exportPdfBlob(filters, average, regional).then((blob) => {
              downloadBlob(blob, 'bazardor-demo-report.pdf')
              toast.success(t('exportPdf'))
            })
          }}
        >
          {t('exportPdf')}
        </Button>
      </div>
    </div>
  )
}
