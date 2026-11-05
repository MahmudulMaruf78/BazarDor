import type { ReactNode } from 'react'
import { ProductImage } from '@/components/common/ProductImage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from 'cn'

type ListingProductCardProps = {
  title: string
  imageUrl?: string
  imageAlt: string
  description?: string
  size?: 'default' | 'sm'
  accentBorder?: boolean
  className?: string
  contentClassName?: string
  children?: ReactNode
}

export function ListingProductCard({
  title,
  imageUrl,
  imageAlt,
  description,
  size = 'default',
  accentBorder = true,
  className,
  contentClassName,
  children,
}: ListingProductCardProps) {
  return (
    <Card
      size={size}
      className={cn(
        'overflow-hidden pt-0',
        accentBorder && 'border-bazardor-green/15',
        className,
      )}
    >
      <ProductImage imageUrl={imageUrl} alt={imageAlt} />
      <CardHeader className="pb-2">
        <CardTitle className="text-base leading-snug">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      {children ? <CardContent className={contentClassName}>{children}</CardContent> : null}
    </Card>
  )
}
