import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MessageKey } from '@/lib/i18n/messages'
import type { OfficialAverageResult } from '@/services/types'
import type { Location } from '@/types/domain/records'
import type { ActivitySummary, RegionalRow, TrendPoint } from '@/features/department/departmentAnalyticsService'
import type { AppLocale } from '@/lib/formatLocale'
import { CHART_TICK_FONT_BN } from '@/lib/formatLocale'
import { cn } from 'cn'
import { formatHeatmapDotTitle } from '@/lib/i18n/userFacingText'
import { chartTheme } from '@/constants/chartTheme'

const { primary: CHART_GREEN, primaryMuted: CHART_GREEN_MUTED, foreground: CHART_NAVY, foregroundMuted: CHART_NAVY_MUTED, muted: CHART_MUTED, grid: CHART_GRID } = chartTheme

function averageKg(result: OfficialAverageResult): number | null {
  return result.status === 'calculated' ? result.averagePricePerKg : null
}

type FormatNumber = (value: number, fractionDigits?: number) => string
type FormatBdtPerKg = (value: number) => string
type Translate = (key: MessageKey) => string
type PickName = (record: { nameEn: string; nameBn: string }) => string

type MapDot = { id: string; x: number; y: number; samples: number; name: string }

type ChartTooltipProps = {
  active?: boolean
  payload?: Array<{ payload?: Record<string, unknown> }>
  formatNumber: FormatNumber
  formatBdtPerKg: FormatBdtPerKg
  t: Translate
  valueKey: 'avgKg' | 'avgKgDisplay'
}

function ChartValueTooltip({ active, payload, formatBdtPerKg, formatNumber, t }: ChartTooltipProps) {
  if (!active || !payload?.[0]?.payload) return null
  const row = payload[0].payload as {
    label: string
    avgKg: number | null
    samples: number
    status: string
  }
  return (
    <div className="rounded-md border border-border/80 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-foreground">{row.label}</p>
      <p className="text-muted-foreground">
        {t('avgKg')}: {row.avgKg != null ? formatBdtPerKg(row.avgKg) : t('insufficient')}
      </p>
      <p className="text-muted-foreground">
        {t('samples')}: {formatNumber(row.samples, 0)}
      </p>
    </div>
  )
}

export function OfficialAverageKpi({
  average,
  formatNumber,
  formatBdtPerKg,
  t,
  scopeLabel,
  calculatedAt,
  formatDate,
}: {
  average: OfficialAverageResult | null
  formatNumber: FormatNumber
  formatBdtPerKg: FormatBdtPerKg
  t: Translate
  scopeLabel: string
  calculatedAt: string
  formatDate: (iso: string) => string
}) {
  if (!average) {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>
  }

  return (
    <div className="rounded-md border border-border/80 bg-background/60 p-4 md:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{scopeLabel}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {t('calculated')}: {formatDate(calculatedAt)}
      </p>
      {average.status === 'calculated' ? (
        <>
          <p className="mt-3 font-semibold tabular-nums text-foreground text-3xl md:text-4xl">
            {formatBdtPerKg(average.averagePricePerKg)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatNumber(average.sampleCount, 0)} {t('farmerSamples')} · {formatDate(average.windowStart)} →{' '}
            {formatDate(average.windowEnd)}
          </p>
        </>
      ) : (
        <p className="mt-3 text-lg font-semibold text-foreground">
          {t('insufficientData')} · {formatNumber(average.sampleCount, 0)} ·{' '}
          {formatNumber(average.distinctFarmerCount, 0)}
        </p>
      )}
    </div>
  )
}

export function TrendBarChart({
  points,
  formatNumber,
  formatBdtPerKg,
  t,
  selectedLabel,
  onSelectPoint,
  trendGranularity,
  formatTrendAxisLabel,
  locale,
}: {
  points: TrendPoint[]
  formatNumber: FormatNumber
  formatBdtPerKg: FormatBdtPerKg
  t: Translate
  selectedLabel?: string | null
  onSelectPoint?: (point: TrendPoint | null) => void
  trendGranularity: 'day' | 'week' | 'month'
  formatTrendAxisLabel: (granularity: 'day' | 'week' | 'month', isoDate: string) => string
  locale: AppLocale
}) {
  const tickFont = locale === 'bn' ? { fontFamily: CHART_TICK_FONT_BN } : undefined
  const chartData = useMemo(
    () =>
      points.map((point) => {
        const iso = point.label.split(':').pop() ?? point.label
        const label = formatTrendAxisLabel(trendGranularity, iso)
        const kg = averageKg(point.result)
        return {
          id: point.label,
          label,
          avgKg: kg ?? 0,
          hasValue: kg != null,
          samples: point.result.sampleCount,
          status: point.result.status,
          point,
        }
      }),
    [points, formatTrendAxisLabel, trendGranularity],
  )

  const selected = points.find((p) => p.label === selectedLabel)

  if (points.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('insufficientData')}</p>
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{t('deptChartClickTrend')}</p>
      <div className="rounded-lg border border-border/80 bg-card p-2">
        <div className="h-56 w-full min-w-0" aria-label={t('priceTrend')}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_GRID} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: CHART_MUTED, ...tickFont }}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fontSize: 11, fill: CHART_MUTED, ...tickFont }}
              width={48}
              tickFormatter={(v) => formatNumber(Number(v), 0)}
            />
            <Tooltip
              cursor={{ fill: CHART_GREEN_MUTED }}
              content={<ChartValueTooltip formatNumber={formatNumber} formatBdtPerKg={formatBdtPerKg} t={t} valueKey="avgKg" />}
            />
            <Bar
              dataKey="avgKg"
              radius={[4, 4, 0, 0]}
              className="cursor-pointer"
              onClick={(bar) => {
                const row = bar.payload as (typeof chartData)[number]
                onSelectPoint?.(row.point)
              }}
            >
              {chartData.map((row) => (
                <Cell
                  key={row.id}
                  fill={row.id === selectedLabel ? CHART_GREEN : row.hasValue ? CHART_GREEN_MUTED : CHART_NAVY_MUTED}
                  stroke={row.id === selectedLabel ? CHART_NAVY : undefined}
                  strokeWidth={row.id === selectedLabel ? 1 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>
      {selected ? (
        <div className="rounded-md border border-border/80 bg-background/70 px-3 py-2 text-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('deptTrendDrillTitle')}</p>
          <p className="mt-1 font-medium text-foreground">
            {formatTrendAxisLabel(trendGranularity, selected.label.split(':').pop() ?? selected.label)}
          </p>
          <p className="text-muted-foreground">
            {selected.result.status === 'calculated'
              ? `${formatBdtPerKg(selected.result.averagePricePerKg)} · ${formatNumber(selected.result.sampleCount, 0)} ${t('samples')}`
              : `${t('insufficientData')} · ${formatNumber(selected.result.sampleCount, 0)} · ${formatNumber(selected.result.distinctFarmerCount, 0)}`}
          </p>
        </div>
      ) : null}
    </div>
  )
}

export function RegionalBarChart({
  rows,
  locations,
  pickName,
  formatNumber,
  formatBdtPerKg,
  t,
  activeLocationId,
  onDrillLocation,
  locale,
}: {
  rows: RegionalRow[]
  locations: Location[]
  pickName: PickName
  formatNumber: FormatNumber
  formatBdtPerKg: FormatBdtPerKg
  t: Translate
  activeLocationId?: string
  onDrillLocation?: (locationId: string) => void
  locale: AppLocale
}) {
  const tickFont = locale === 'bn' ? { fontFamily: CHART_TICK_FONT_BN } : undefined
  const chartData = useMemo(
    () =>
      rows.map((row) => {
        const loc = locations.find((l) => l.id === row.locationId)
        const name = loc ? pickName(loc) : row.locationName
        const kg = averageKg(row.result)
        return {
          locationId: row.locationId,
          label: name,
          avgKg: kg ?? 0,
          hasValue: kg != null,
          samples: row.result.sampleCount,
          status: row.result.status,
        }
      }),
    [rows, locations, pickName],
  )

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('insufficientData')}</p>
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{t('deptChartClickRegion')}</p>
      <div className="rounded-lg border border-border/80 bg-card p-2">
        <div className="h-56 w-full min-w-0" aria-label={t('regionalComparison')}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={chartData} margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={CHART_GRID} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: CHART_MUTED, ...tickFont }}
              tickFormatter={(v) => formatNumber(Number(v), 0)}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={88}
              tick={{ fontSize: 11, fill: CHART_NAVY, ...tickFont }}
            />
            <Tooltip
              cursor={{ fill: `${CHART_NAVY_MUTED}` }}
              content={<ChartValueTooltip formatNumber={formatNumber} formatBdtPerKg={formatBdtPerKg} t={t} valueKey="avgKg" />}
            />
            <Bar
              dataKey="avgKg"
              radius={[0, 4, 4, 0]}
              className="cursor-pointer"
              onClick={(bar) => {
                const row = bar.payload as (typeof chartData)[number]
                onDrillLocation?.(row.locationId)
              }}
            >
              {chartData.map((row) => (
                <Cell
                  key={row.locationId}
                  fill={
                    row.locationId === activeLocationId
                      ? CHART_GREEN
                      : row.hasValue
                        ? CHART_NAVY
                        : CHART_NAVY_MUTED
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export function RegionalSampleHeatmap({
  dots,
  t,
  locale,
  onSelectLocation,
}: {
  dots: MapDot[]
  t: Translate
  locale: AppLocale
  onSelectLocation?: (locationId: string) => void
}) {
  if (dots.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{t('demoHeatmap')}</p>
      <svg
        viewBox="0 0 100 100"
        className="h-44 w-full rounded-md border border-border/80 bg-white"
        role="img"
        aria-label={t('demoHeatmap')}
      >
        {[20, 40, 60, 80].map((n) => (
          <g key={n} className="stroke-border/60" strokeWidth="0.15">
            <line x1={n} y1={8} x2={n} y2={92} />
            <line x1={8} y1={n} x2={92} y2={n} />
          </g>
        ))}
        <rect x={8} y={8} width={84} height={84} fill="none" className="stroke-border/80" strokeWidth="0.35" />
        {dots.map((dot) => (
          <g key={dot.id}>
            <circle
              cx={dot.x}
              cy={dot.y}
              r={Math.max(3.5, Math.min(14, dot.samples * 2.8))}
              className={cn(
                'fill-primary/35 stroke-primary',
                onSelectLocation && 'cursor-pointer hover:fill-primary/55',
              )}
              strokeWidth="0.6"
              onClick={() => onSelectLocation?.(dot.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') onSelectLocation?.(dot.id)
              }}
              tabIndex={onSelectLocation ? 0 : undefined}
              role={onSelectLocation ? 'button' : undefined}
            />
            <title>{formatHeatmapDotTitle(locale, dot.name, dot.samples)}</title>
          </g>
        ))}
      </svg>
    </div>
  )
}

export function ActivityMetricTiles({
  activity,
  t,
  formatNumber,
}: {
  activity: ActivitySummary | null
  t: Translate
  formatNumber: FormatNumber
}) {
  const items = [
    { label: t('activeListings'), value: activity?.activeListings },
    { label: t('demoTransactions'), value: activity?.transactionCount },
    { label: t('approvedPriceObs'), value: activity?.approvedPriceEntries },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-md border border-border/80 bg-background/50 px-4 py-3"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            {item.value != null ? formatNumber(item.value, 0) : '…'}
          </p>
        </div>
      ))}
    </div>
  )
}
