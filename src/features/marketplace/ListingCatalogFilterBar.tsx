import { useMemo, useState } from 'react'
import { Filter, RotateCcw } from 'lucide-react'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { BangladeshLocationSelector } from '@/components/common/BangladeshLocationSelector'
import type { BangladeshLocationSelection } from '@/data/bangladeshLocationIndex'
import { formatVariantSummary } from '@/services/productVariantCatalog'
import type { Category, ProductVariant } from '@/types/domain/records'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from 'cn'

type ListingCatalogFilterBarProps = {
  categories: readonly Category[]
  categoryId?: string
  onCategoryChange: (categoryId: string | undefined) => void
  locationSel: BangladeshLocationSelection
  onLocationChange: (sel: BangladeshLocationSelection) => void
  variants?: readonly ProductVariant[]
  variantId?: string
  onVariantChange?: (variantId: string | undefined) => void
  onReset?: () => void
}

function countActiveFilters(
  categoryId: string | undefined,
  variantId: string | undefined,
  locationSel: BangladeshLocationSelection,
): number {
  let n = 0
  if (categoryId) n += 1
  if (variantId) n += 1
  if (locationSel.divisionId) n += 1
  if (locationSel.districtId) n += 1
  if (locationSel.upazilaId) n += 1
  if (locationSel.unionId) n += 1
  return n
}

export function ListingCatalogFilterBar({
  categories,
  categoryId,
  onCategoryChange,
  locationSel,
  onLocationChange,
  variants,
  variantId,
  onVariantChange,
  onReset,
}: ListingCatalogFilterBarProps) {
  const { t, pickName, locale } = useI18n()
  const [open, setOpen] = useState(false)
  const activeCount = useMemo(
    () => countActiveFilters(categoryId, variantId, locationSel),
    [categoryId, variantId, locationSel],
  )
  const panelId = 'listing-catalog-filters-panel'

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {!open && activeCount > 0 ? (
          <Badge variant="secondary" className="font-normal tabular-nums">
            {activeCount}
          </Badge>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-expanded={open}
          aria-controls={panelId}
          data-icon="inline-start"
          className={cn('border-primary/25 bg-card/80', open && 'border-primary/40 bg-primary/5')}
          onClick={() => setOpen((prev) => !prev)}
        >
          <Filter aria-hidden />
          {open ? t('hideFilters') : t('filters')}
        </Button>
      </div>

      {open ? (
        <div
          id={panelId}
          className="rounded-lg border border-primary/15 bg-secondary/25 p-3 shadow-sm sm:p-4"
        >
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[9rem] flex-1 space-y-1.5 sm:max-w-[11rem]">
              <Label className="text-xs font-medium text-foreground/80">{t('category')}</Label>
              <Select
                value={categoryId ?? 'all'}
                onValueChange={(value) => onCategoryChange(!value || value === 'all' ? undefined : value)}
              >
                <SelectTrigger className="w-full bg-background/90">
                  <SelectValue placeholder={t('all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allCategories')}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {pickName(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {variants && variants.length > 0 && onVariantChange ? (
              <div className="min-w-[9rem] flex-1 space-y-1.5 sm:max-w-[11rem]">
                <Label className="text-xs font-medium text-foreground/80">{t('browseFilterVariant')}</Label>
                <Select
                  value={variantId ?? 'all'}
                  onValueChange={(value) => onVariantChange(!value || value === 'all' ? undefined : value)}
                >
                  <SelectTrigger className="w-full bg-background/90">
                    <SelectValue placeholder={t('browseAllVariants')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('browseAllVariants')}</SelectItem>
                    {variants.map((variant) => (
                      <SelectItem key={variant.id} value={variant.id}>
                        {formatVariantSummary(variant, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <BangladeshLocationSelector
              compact
              value={locationSel}
              onChange={onLocationChange}
              className="grid min-w-0 flex-1 grid-cols-2 gap-3 lg:grid-cols-4"
            />
            {onReset ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={activeCount === 0}
                data-icon="inline-start"
                className="ml-auto shrink-0 border-primary/20 bg-background/90"
                onClick={onReset}
              >
                <RotateCcw aria-hidden />
                {t('resetFilters')}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
