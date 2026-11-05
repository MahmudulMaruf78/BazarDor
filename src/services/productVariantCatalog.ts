import type { Listing, Product, ProductVariant } from '@/types/domain/records'
import type { AppLocale } from '@/lib/formatLocale'

export function defaultVariantId(productId: string): string {
  return `var-${productId}-standard`
}

/** ponytail: IDB without variant rows — still render standard browse cards. */
export function standardVariantFallback(productId: string): ProductVariant {
  return { id: defaultVariantId(productId), productId }
}

export function resolveEffectiveVariantId(listing: Pick<Listing, 'productId' | 'variantId'>): string {
  return listing.variantId ?? defaultVariantId(listing.productId)
}

export function catalogGroupKey(listing: Pick<Listing, 'productId' | 'variantId'>): string {
  return `${listing.productId}::${resolveEffectiveVariantId(listing)}`
}

export function isDefaultStandardVariant(variant: ProductVariant): boolean {
  return variant.id === defaultVariantId(variant.productId)
}

/** UI line from variant fields; caller adds demo-sample disclaimer via i18n when needed. */
export function formatVariantSummary(
  variant: ProductVariant,
  locale: AppLocale,
): string {
  const parts: string[] = []
  if (variant.grade) parts.push(variant.grade)
  if (variant.quality) parts.push(variant.quality)
  if (variant.variety) parts.push(variant.variety)
  if (variant.size) parts.push(variant.size)
  const desc = locale === 'bn' ? variant.descriptionBn : variant.descriptionEn
  if (desc) parts.push(desc)
  if (parts.length === 0 && isDefaultStandardVariant(variant)) {
    return locale === 'bn' ? 'স্ট্যান্ডার্ড (ডেমো নমুনা)' : 'Standard (demo sample)'
  }
  return parts.join(' · ')
}

export function formatBrowseCardTitle(
  product: Product,
  variant: ProductVariant,
  pickName: (row: { nameEn: string; nameBn: string }) => string,
): string {
  const base = pickName(product)
  if (isDefaultStandardVariant(variant)) return base
  const line = formatVariantSummary(variant, 'en')
  return line ? `${base} — ${line}` : base
}

export function groupListingsByCatalogKey(listings: readonly Listing[]): Map<string, Listing[]> {
  const map = new Map<string, Listing[]>()
  for (const listing of listings) {
    const key = catalogGroupKey(listing)
    const bucket = map.get(key)
    if (bucket) bucket.push(listing)
    else map.set(key, [listing])
  }
  return map
}
