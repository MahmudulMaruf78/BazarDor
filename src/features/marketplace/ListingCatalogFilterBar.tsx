import { useI18n } from '@/app/preferences/LocaleProvider'
import { BangladeshLocationSelector } from '@/components/common/BangladeshLocationSelector'
import type { BangladeshLocationSelection } from '@/data/bangladeshLocationIndex'
import type { Category } from '@/types/domain/records'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type ListingCatalogFilterBarProps = {
  categories: readonly Category[]
  categoryId?: string
  onCategoryChange: (categoryId: string | undefined) => void
  locationSel: BangladeshLocationSelection
  onLocationChange: (sel: BangladeshLocationSelection) => void
}

export function ListingCatalogFilterBar({
  categories,
  categoryId,
  onCategoryChange,
  locationSel,
  onLocationChange,
}: ListingCatalogFilterBarProps) {
  const { t, pickName } = useI18n()

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 lg:items-end">
      <div className="min-w-0 space-y-1">
        <Label className="text-xs">{t('category')}</Label>
        <Select
          value={categoryId ?? 'all'}
          onValueChange={(value) => onCategoryChange(!value || value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-full">
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

      <BangladeshLocationSelector
        compact
        value={locationSel}
        onChange={onLocationChange}
        className="col-span-2 grid grid-cols-2 gap-2 sm:col-span-2 sm:grid-cols-4 lg:col-span-4 lg:grid-cols-4 xl:col-span-5 xl:grid-cols-5"
      />
    </div>
  )
}
