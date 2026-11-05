import { Link } from 'react-router-dom'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { ProductImage } from '@/components/common/ProductImage'
import type { ProductCardBadge } from '@/features/marketplace/ListingProductCard'
import { ProductCardMarketStats } from '@/features/marketplace/ProductCardMarketStats'
import type { ProductCardMarketSnapshot } from '@/services/productCardMarketSnapshot'
import { Badge } from '@/components/ui/badge'
import { cn } from 'cn'

export type ProductDetailVariantPill = {
  id: string
  label: string
  href: string
  isCurrent: boolean
  showDemoSampleBadge?: boolean
}

type ProductDetailImageProps = {
  imageUrl?: string
  imageAlt: string
  className?: string
}

export function ProductDetailImage({ imageUrl, imageAlt, className }: ProductDetailImageProps) {
  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-primary/15 bg-card shadow-sm',
        className,
      )}
    >
      <div className="relative min-h-0 flex-1 bg-muted/15">
        <ProductImage
          imageUrl={imageUrl}
          alt={imageAlt}
          className="aspect-[4/3] w-full object-cover lg:absolute lg:inset-0 lg:aspect-auto lg:h-full lg:min-h-full"
        />
      </div>
    </div>
  )
}

type ProductDetailInfoProps = {
  badges: ProductCardBadge[]
  sellerCount: number
  listingCount: number
  heroSnapshot?: ProductCardMarketSnapshot
  locationChain?: string
  unitLabel: string
  variantPills: ProductDetailVariantPill[]
  className?: string
}

export function ProductDetailInfo({
  badges,
  sellerCount,
  listingCount,
  heroSnapshot,
  locationChain,
  unitLabel,
  variantPills,
  className,
}: ProductDetailInfoProps) {
  const { t, formatNumber } = useI18n()
  const sellerMeta = `${t('productCardSellerCount').replace('{count}', formatNumber(sellerCount, 0))} · ${t('productCardListingCount').replace('{count}', formatNumber(listingCount, 0))}`
  const showStats = heroSnapshot && locationChain

  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col gap-4 rounded-xl border border-primary/15 bg-card p-4 shadow-sm sm:p-5',
        className,
      )}
    >
      {badges.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {badges.map((badge) => (
            <Badge
              key={badge.label}
              variant={badge.variant ?? 'secondary'}
              className="h-auto min-h-5 max-w-full whitespace-normal px-1.5 py-0.5 text-[0.65rem] leading-tight"
            >
              {badge.label}
            </Badge>
          ))}
        </div>
      ) : null}

      <p className="text-sm font-medium text-muted-foreground">{sellerMeta}</p>

      {variantPills.length > 0 ? (
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{t('productDetailVariant')}</p>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {variantPills.map((pill) =>
              pill.isCurrent ? (
                <span
                  key={pill.id}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs font-medium text-foreground"
                >
                  {pill.label}
                  {pill.showDemoSampleBadge ? (
                    <Badge variant="secondary" className="h-4 px-1 py-0 text-[0.6rem]">
                      {t('productVariantDemoSample')}
                    </Badge>
                  ) : null}
                </span>
              ) : (
                <Link
                  key={pill.id}
                  to={pill.href}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-primary underline-offset-4 hover:border-primary/40 hover:bg-secondary/40"
                >
                  {pill.label}
                  {pill.showDemoSampleBadge ? (
                    <Badge variant="secondary" className="h-4 px-1 py-0 text-[0.6rem]">
                      {t('productVariantDemoSample')}
                    </Badge>
                  ) : null}
                </Link>
              ),
            )}
          </div>
        </div>
      ) : null}

      {showStats ? (
        <ProductCardMarketStats
          locationChain={locationChain}
          askingPricePerUnit={heroSnapshot.askingPricePerUnit}
          unitLabel={unitLabel}
          officialAverage={heroSnapshot.officialAverage}
        />
      ) : (
        // ponytail: no hero snapshot — empty panel only, no invented prices
        <div className="rounded-md border border-dashed border-border/80 bg-muted/20 px-3 py-4 text-sm text-muted-foreground">
          {t('productDetailNoOffers')}
        </div>
      )}

      <p className="mt-auto text-xs text-muted-foreground">{t('browseShowcasePriceHint')}</p>
    </div>
  )
}
