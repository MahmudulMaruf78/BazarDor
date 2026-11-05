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
      <div className="space-y-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs leading-snug">
        <div>
          <dt className="font-medium text-muted-foreground">{t('location')}</dt>
          <dd className="mt-0.5 line-clamp-2 text-foreground">{locationChain}</dd>
        </div>
        <div className="border-t border-border/50 pt-2">
          <dt className="font-medium text-muted-foreground">{t('officialMarketAvg')}</dt>
          <dd
            className={cn(
              'mt-0.5 font-semibold tabular-nums',
              officialAverage.status === 'calculated' ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            {officialText}
          </dd>
        </div>
      </div>
    </dl>
  )
}
