import { useI18n } from '@/app/preferences/LocaleProvider'
import type { OfficialAverageResult } from '@/services/types'
import { cn } from 'cn'

type ProductCardMarketStatsProps = {
  locationChain: string
  askingPricePerUnit: number
  unitLabel: string
  officialAverage: OfficialAverageResult
  className?: string
}

export function ProductCardMarketStats({
  locationChain,
  askingPricePerUnit,
  unitLabel,
  officialAverage,
  className,
}: ProductCardMarketStatsProps) {
  const { t, formatNumber } = useI18n()
  const officialText =
    officialAverage.status === 'calculated'
      ? `${formatNumber(officialAverage.averagePricePerKg)}${t('perKgSuffix')}`
      : t('insufficientData')

  return (
    <dl className={cn('flex flex-1 flex-col gap-2.5 text-sm', className)}>
      <div className="rounded-lg border border-primary/15 bg-gradient-to-br from-background to-secondary/40 px-3 py-2.5 shadow-xs">
        <dt className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
          {t('listingPrice')}
        </dt>
        <dd className="mt-1 font-semibold tabular-nums text-foreground text-2xl leading-none tracking-tight">
          {formatNumber(askingPricePerUnit)}
          <span className="text-sm font-medium text-muted-foreground">/{unitLabel}</span>
        </dd>
      </div>
      <div className="rounded-md border border-border/70 bg-secondary/30 px-2.5 py-2">
        <dt className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
          {t('location')}
        </dt>
        <dd className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-foreground">{locationChain}</dd>
      </div>
      <div
        className={cn(
          'rounded-md border px-2.5 py-2',
          officialAverage.status === 'calculated'
            ? 'border-primary/35 bg-primary/10'
            : 'border-border/50 bg-muted/30',
        )}
      >
        <dt className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
          {t('officialMarketAvg')}
        </dt>
        <dd
          className={cn(
            'mt-1 tabular-nums leading-none tracking-tight',
            officialAverage.status === 'calculated'
              ? 'text-xl font-semibold text-primary'
              : 'text-sm font-medium text-muted-foreground',
          )}
        >
          {officialText}
        </dd>
      </div>
    </dl>
  )
}
