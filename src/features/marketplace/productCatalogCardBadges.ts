import type { ProductCardBadge } from '@/features/marketplace/ListingProductCard'
import type { OfficialAverageResult } from '@/services/types'
import type { MessageKey } from '@/lib/i18n/messages'

type CatalogBadgeInput = {
  sellerCount: number
  officialAverage: OfficialAverageResult
}

/** ponytail: demo-only badges from real browse counts — no invented gov labels */
export function buildProductCatalogCardBadges(
  t: (key: MessageKey) => string,
  { sellerCount, officialAverage }: CatalogBadgeInput,
): ProductCardBadge[] {
  const badges: ProductCardBadge[] = [
    { label: t('productCardBadgeDemo'), variant: 'secondary' },
  ]
  if (sellerCount > 1) {
    badges.push({ label: t('productCardBadgeMultiSeller'), variant: 'outline' })
  }
  if (officialAverage.status === 'calculated') {
    badges.push({ label: t('productCardBadgeOfficialAvg'), variant: 'default' })
  } else {
    badges.push({ label: t('productCardBadgeInsufficientAvg'), variant: 'ghost' })
  }
  return badges
}
