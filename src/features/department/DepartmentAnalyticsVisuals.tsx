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
import { cn } from 'cn'

const CHART_GREEN = '#1b6b45'
const CHART_GREEN_MUTED = '#1b6b4580'
const CHART_NAVY = '#17324d'
const CHART_NAVY_MUTED = '#17324d66'

function averageKg(result: OfficialAverageResult): number | null {
  return result.status === 'calculated' ? result.averagePricePerKg : null
}

type FormatNumber = (value: number, fractionDigits?: number) => string
type Translate = (key: MessageKey) => string
type PickName = (record: { nameEn: string; nameBn: string }) => string

type MapDot = { id: string; x: number; y: number; samples: number; name: string }

type ChartTooltipProps = {
  active?: boolean
  payload?: Array<{ payload?: Record<string, unknown> }>
  formatNumber: FormatNumber
  t: Translate
  valueKey: 'avgKg' | 'avgKgDisplay'
}

function ChartValueTooltip({ active, payload, formatNumber, t }: ChartTooltipProps) {
  if (!active || !payload?.[0]?.payload) return null
  const row = payload[0].payload as {
    label: string
    avgKg: number | null
    samples: number
    status: string
  }
  return (
    <div className="rounded-md border border-border/80 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-bazardor-navy">{row.label}</p>
      <p className="text-bazardor-muted">
        {t('avgKg')}: {row.avgKg != null ? `${formatNumber(row.avgKg)} BDT/kg` : t('insufficient')}
      </p>
      <p className="text-bazardor-muted">
        {t('samples')}: {row.samples}
      </p>
    </div>
  )
}

export function OfficialAverageKpi({
  average,
  formatNumber,
  t,
  scopeLabel,
  calculatedAt,
}: {
  average: OfficialAverageResult | null
  formatNumber: FormatNumber
  t: Translate
  scopeLabel: string
  calculatedAt: string
}) {
  if (!average) {
    return <p className="text-sm text-bazardor-muted">{t('loading')}</p>
  }

  return (
    <div className="rounded-md border border-border/80 bg-bazardor-surface/60 p-4 md:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-bazardor-muted">{scopeLabel}</p>
      <p className="mt-1 text-xs text-bazardor-muted">
        {t('calculated')}: {calculatedAt.slice(0, 19)}
      </p>
      {average.status === 'calculated' ? (
        <>
          <p className="mt-3 font-semibold tabular-nums text-bazardor-navy text-3xl md:text-4xl">
            {formatNumber(average.averagePricePerKg)}{' '}
            <span className="text-lg font-medium text-bazardor-muted">BDT/kg</span>
          </p>
          <p className="mt-2 text-sm text-bazardor-muted">
            {formatNumber(average.sampleCount, 0)} {t('farmerSamples')} · {average.windowStart.slice(0, 10)} →{' '}
            {average.windowEnd.slice(0, 10)}
          </p>
        </>
      ) : (
        <p className="mt-3 text-lg font-semibold text-bazardor-navy">
          {t('insufficientData')} · {average.sampleCount} · {average.distinctFarmerCount}
        </p>
      )}
    </div>
  )
}

export function TrendBarChart({
  points,
  formatNumber,
  t,
  selectedLabel,
  onSelectPoint,
}: {
  points: TrendPoint[]
  formatNumber: FormatNumber
  t: Translate
  selectedLabel?: string | null
  onSelectPoint?: (point: TrendPoint | null) => void
}) {
  const chartData = useMemo(
    () =>
      points.map((point) => {
        const label = point.label.split(':').pop() ?? point.label
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
    [points],
  )

  const selected = points.find((p) => p.label === selectedLabel)

  if (points.length === 0) {
    return <p className="text-sm text-bazardor-muted">{t('insufficientData')}</p>
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-bazardor-muted">{t('deptChartClickTrend')}</p>
      <div className="h-56 w-full min-w-0" aria-label={t('priceTrend')}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#5c6b7a' }} interval={0} angle={-25} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11, fill: '#5c6b7a' }} width={48} />
            <Tooltip
              cursor={{ fill: 'rgba(27, 107, 69, 0.08)' }}
              content={<ChartValueTooltip formatNumber={formatNumber} t={t} valueKey="avgKg" />}
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
      {selected ? (
        <div className="rounded-md border border-border/80 bg-bazardor-surface/70 px-3 py-2 text-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-bazardor-muted">{t('deptTrendDrillTitle')}</p>
          <p className="mt-1 font-medium text-bazardor-navy">{selected.label.split(':').pop()}</p>
          <p className="text-bazardor-muted">
            {selected.result.status === 'calculated'
              ? `${formatNumber(selected.result.averagePricePerKg)} BDT/kg · ${formatNumber(selected.result.sampleCount, 0)} ${t('samples')}`
              : `${t('insufficientData')} · ${selected.result.sampleCount} · ${selected.result.distinctFarmerCount}`}
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
  t,
  activeLocationId,
  onDrillLocation,
}: {
  rows: RegionalRow[]
  locations: Location[]
  pickName: PickName
  formatNumber: FormatNumber
  t: Translate
  activeLocationId?: string
  onDrillLocation?: (locationId: string) => void
}) {
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
    return <p className="text-sm text-bazardor-muted">{t('insufficientData')}</p>
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-bazardor-muted">{t('deptChartClickRegion')}</p>
      <div className="h-56 w-full min-w-0" aria-label={t('regionalComparison')}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={chartData} margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#5c6b7a' }} />
            <YAxis type="category" dataKey="label" width={88} tick={{ fontSize: 11, fill: '#17324d' }} />
            <Tooltip
              cursor={{ fill: 'rgba(23, 50, 77, 0.06)' }}
              content={<ChartValueTooltip formatNumber={formatNumber} t={t} valueKey="avgKg" />}
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
  )
}

export function RegionalSampleHeatmap({
  dots,
  t,
  onSelectLocation,
}: {
  dots: MapDot[]
  t: Translate
  onSelectLocation?: (locationId: string) => void
}) {
  if (dots.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs text-bazardor-muted">{t('demoHeatmap')}</p>
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
                'fill-bazardor-green/35 stroke-bazardor-green',
                onSelectLocation && 'cursor-pointer hover:fill-bazardor-green/55',
              )}
              strokeWidth="0.6"
              onClick={() => onSelectLocation?.(dot.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') onSelectLocation?.(dot.id)
              }}
              tabIndex={onSelectLocation ? 0 : undefined}
              role={onSelectLocation ? 'button' : undefined}
            />
            <title>{`${dot.name}: ${dot.samples} samples`}</title>
          </g>
        ))}
      </svg>
    </div>
  )
}

export function ActivityMetricTiles({
  activity,
  t,
}: {
  activity: ActivitySummary | null
  t: Translate
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
          className="rounded-md border border-border/80 bg-bazardor-surface/50 px-4 py-3"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-bazardor-muted">{item.label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-bazardor-navy">
            {item.value ?? '…'}
          </p>
        </div>
      ))}
    </div>
  )
}
