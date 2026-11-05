import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ProductImage } from '@/components/common/ProductImage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from 'cn'

type ListingProductCardProps = {
  title: string
  imageUrl?: string
  imageAlt: string
  description?: string
  size?: 'default' | 'sm'
  /** ponytail: off by default — accent only when caller needs emphasis */
  accentBorder?: boolean
  className?: string
  contentClassName?: string
  /** When set, whole card navigates to product or listing detail. */
  to?: string
  children?: ReactNode
}

export function ListingProductCard({
  title,
  imageUrl,
  imageAlt,
  description,
  size = 'default',
  accentBorder = false,
  className,
  contentClassName,
  to,
  children,
}: ListingProductCardProps) {
  const card = (
    <Card
      size={size}
      className={cn(
        'flex h-full flex-col overflow-hidden pt-0 transition-colors hover:border-border',
        accentBorder && 'border-l-[3px] border-l-bazardor-green/70',
        to && 'cursor-pointer hover:border-bazardor-green/40 focus-within:ring-2 focus-within:ring-ring',
        className,
      )}
    >
      <div className="border-b border-border/60 bg-muted/20">
        <ProductImage
          imageUrl={imageUrl}
          alt={imageAlt}
          className={size === 'sm' ? 'aspect-[4/3]' : 'aspect-[5/3]'}
        />
      </div>
      <CardHeader className="gap-1 pb-0 pt-3">
        <CardTitle
          className={cn(
            'line-clamp-2 font-semibold text-bazardor-navy',
            size === 'sm' ? 'text-sm' : 'text-base',
          )}
        >
          {title}
        </CardTitle>
        {description ? <p className="text-xs text-bazardor-muted">{description}</p> : null}
      </CardHeader>
      {children ? (
        <CardContent className={cn('flex flex-1 flex-col gap-3 pb-4 pt-2', contentClassName)}>
          {children}
        </CardContent>
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
