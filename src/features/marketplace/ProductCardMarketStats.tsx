import { useI18n } from '@/app/preferences/LocaleProvider'
import type { OfficialAverageResult } from '@/services/types'
import { cn } from 'cn'

type ProductCardMarketStatsProps = {
  locationChain: string
  askingPricePerUnit: number
  unitCode: string
  officialAverage: OfficialAverageResult
  className?: string
}

export function ProductCardMarketStats({
  locationChain,
  askingPricePerUnit,
  unitCode,
  officialAverage,
  className,
}: ProductCardMarketStatsProps) {
  const { t, formatNumber } = useI18n()
  const officialText =
    officialAverage.status === 'calculated'
      ? `${formatNumber(officialAverage.averagePricePerKg)}/kg`
      : t('insufficientData')

  return (
    <dl className={cn('space-y-2 text-sm', className)}>
      <div className="rounded-md border border-border/70 bg-bazardor-surface/80 px-3 py-2.5">
        <dt className="text-[0.6875rem] font-medium uppercase tracking-wide text-bazardor-muted">
          {t('listingPrice')}
        </dt>
        <dd className="mt-0.5 font-semibold tabular-nums text-bazardor-navy text-xl leading-tight">
          {formatNumber(askingPricePerUnit)}
          <span className="text-sm font-medium text-bazardor-muted">/{unitCode}</span>
        </dd>
      </div>
      <div className="grid gap-1.5 text-xs leading-snug">
        <div className="flex gap-2">
          <dt className="shrink-0 text-bazardor-muted">{t('location')}</dt>
          <dd className="min-w-0 text-bazardor-navy">{locationChain}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 text-bazardor-muted">{t('officialMarketAvg')}</dt>
          <dd
            className={cn(
              'font-medium tabular-nums',
              officialAverage.status === 'calculated' ? 'text-bazardor-green' : 'text-bazardor-muted',
            )}
          >
            {officialText}
          </dd>
        </div>
      </div>
    </dl>
  )
}
