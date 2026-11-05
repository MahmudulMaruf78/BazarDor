import { useI18n } from '@/app/preferences/LocaleProvider'
import type { OfficialAverageResult } from '@/services/types'

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

  return (
    <div className={className ?? 'space-y-1.5 text-sm'}>
      <p>
        <span className="text-bazardor-muted">{t('location')}: </span>
        {locationChain}
      </p>
      <p>
        <span className="text-bazardor-muted">{t('listingPrice')}: </span>
        {formatNumber(askingPricePerUnit)}/{unitCode}
      </p>
      <p>
        <span className="text-bazardor-muted">{t('officialMarketAvg')}: </span>
        {officialAverage.status === 'calculated'
          ? `${formatNumber(officialAverage.averagePricePerKg)}/kg`
          : t('insufficientData')}
      </p>
    </div>
  )
}
