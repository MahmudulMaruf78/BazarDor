import type { Product } from '@/types/domain/records'

export type ProductComboboxOption = Pick<Product, 'id' | 'nameEn'> & { nameBn?: string }

type PickName = (p: Product) => string

export function productDisplayName(
  p: ProductComboboxOption,
  locale: 'en' | 'bn',
  pickName: PickName,
): string {
  return p.nameBn && locale === 'bn' ? p.nameBn : pickName(p as Product)
}

export function resolveProductId(
  input: string,
  products: readonly ProductComboboxOption[],
  displayName: (p: ProductComboboxOption) => string,
): string {
  const trimmed = input.trim()
  if (!trimmed) return ''
  const exactId = products.find((p) => p.id === trimmed)
  if (exactId) return exactId.id
  const lower = trimmed.toLowerCase()
  const byName = products.find(
    (p) =>
      p.nameEn.toLowerCase() === lower ||
      p.nameBn === trimmed ||
      displayName(p).toLowerCase() === lower,
  )
  if (byName) return byName.id
  const partial = products.find(
    (p) =>
      p.id.toLowerCase().includes(lower) ||
      p.nameEn.toLowerCase().includes(lower) ||
      (p.nameBn?.includes(trimmed) ?? false),
  )
  return partial?.id ?? trimmed
}

export function filterProductsByQuery(
  products: readonly ProductComboboxOption[],
  query: string,
  displayName: (p: ProductComboboxOption) => string,
): readonly ProductComboboxOption[] {
  const trimmed = query.trim()
  if (!trimmed) return products
  const lower = trimmed.toLowerCase()
  return products.filter(
    (p) =>
      p.id.toLowerCase().includes(lower) ||
      p.nameEn.toLowerCase().includes(lower) ||
      (p.nameBn?.includes(trimmed) ?? false) ||
      displayName(p).toLowerCase().includes(lower),
  )
}
