import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { ProductImage } from '@/components/common/ProductImage'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from 'cn'

export type ProductCardBadge = {
  label: string
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
}

type ListingProductCardProps = {
  title: string
  imageUrl?: string
  imageAlt: string
  description?: string
  badges?: ProductCardBadge[]
  size?: 'default' | 'sm'
  /** ponytail: off by default — accent only when caller needs emphasis */
  accentBorder?: boolean
  className?: string
  contentClassName?: string
  showViewHint?: boolean
  /** When set, whole card navigates to product or listing detail. */
  to?: string
  children?: ReactNode
}

export function ListingProductCard({
  title,
  imageUrl,
  imageAlt,
  description,
  badges,
  size = 'default',
  accentBorder = false,
  className,
  contentClassName,
  showViewHint = false,
  to,
  children,
}: ListingProductCardProps) {
  const { t } = useI18n()

  const card = (
    <Card
      size={size}
      className={cn(
        'group/card flex h-full flex-col overflow-hidden border-primary/15 bg-card pt-0 shadow-sm transition-all',
        'hover:border-primary/35 hover:shadow-md',
        accentBorder && 'border-l-[3px] border-l-primary/70',
        to && 'cursor-pointer focus-within:ring-2 focus-within:ring-ring',
        className,
      )}
    >
      <div className="relative border-b border-border/50 bg-muted/15">
        <ProductImage
          imageUrl={imageUrl}
          alt={imageAlt}
          className={cn(
            size === 'sm' ? 'aspect-[4/3]' : 'aspect-[5/3]',
            'transition-transform duration-300 group-hover/card:scale-[1.02]',
          )}
        />
      </div>
      <CardHeader className="gap-1.5 pb-0 pt-3">
        {badges && badges.length > 0 ? (
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
        <CardTitle
          className={cn(
            'line-clamp-2 font-semibold text-foreground transition-colors group-hover/card:text-primary',
            size === 'sm' ? 'text-sm' : 'text-base',
          )}
        >
          {title}
        </CardTitle>
        {description ? (
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      {children ? (
        <CardContent className={cn('flex flex-1 flex-col gap-3 pb-3 pt-2', contentClassName)}>
          {children}
        </CardContent>
      ) : null}
      {showViewHint && to ? (
        <CardFooter className="mt-auto border-t border-border/60 bg-muted/20 py-2.5 text-xs font-medium text-primary">
          <span className="flex w-full items-center justify-between gap-2">
            {t('productCardViewDetails')}
            <ChevronRight className="size-4 shrink-0 opacity-70 transition-transform group-hover/card:translate-x-0.5" aria-hidden />
          </span>
        </CardFooter>
      ) : null}
    </Card>
  )

  if (to) {
    return (
      <Link to={to} className="block h-full rounded-xl outline-none">
        {card}
      </Link>
    )
  }

  return card
}
