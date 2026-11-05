import { cn } from 'cn'

type ProductImageProps = {
  imageUrl?: string
  alt: string
  className?: string
}

/** ponytail: static SVG paths from seed only — swap for CDN when real catalog media exists */
export function ProductImage({ imageUrl, alt, className }: ProductImageProps) {
  const src = imageUrl ?? '/demo-products/placeholder.svg'
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn('aspect-[4/3] w-full object-cover', className)}
    />
  )
}
