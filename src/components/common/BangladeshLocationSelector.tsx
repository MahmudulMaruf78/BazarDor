import { useMemo } from 'react'
import { useI18n } from '@/app/preferences/LocaleProvider'
import {
  formatBangladeshLocationLabel,
  getBangladeshChildren,
  pickBangladeshName,
  type BangladeshLocationSelection,
} from '@/data/bangladeshLocationIndex'
import {
  applyBangladeshLocationLevelChange,
  sanitizeBangladeshLocationSelection,
} from '@/services/bangladeshLocationValidation'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type BangladeshLocationSelectorProps = {
  value: BangladeshLocationSelection
  onChange: (next: BangladeshLocationSelection) => void
  required?: boolean
  disabled?: boolean
  /** When true, require union if the upazila has union children. */
  unionRequired?: boolean
  /** Smaller labels for inline catalog filter bars. */
  compact?: boolean
  className?: string
}

export function BangladeshLocationSelector({
  value,
  onChange,
  required,
  disabled,
  unionRequired = false,
  compact = false,
  className,
}: BangladeshLocationSelectorProps) {
  const { t, locale } = useI18n()
  const labelClass = compact ? 'text-xs' : undefined

  const selection = useMemo(() => sanitizeBangladeshLocationSelection(value), [value])

  const divisions = useMemo(() => getBangladeshChildren(undefined), [])
  const districts = useMemo(
    () => (selection.divisionId ? getBangladeshChildren(selection.divisionId) : []),
    [selection.divisionId],
  )
  const upazilas = useMemo(
    () => (selection.districtId ? getBangladeshChildren(selection.districtId) : []),
    [selection.districtId],
  )
  const unions = useMemo(
    () => (selection.upazilaId ? getBangladeshChildren(selection.upazilaId) : []),
    [selection.upazilaId],
  )

  const districtValue = districts.some((n) => n.id === selection.districtId) ? selection.districtId ?? '' : ''
  const upazilaValue = upazilas.some((n) => n.id === selection.upazilaId) ? selection.upazilaId ?? '' : ''
  const unionValue = unions.some((n) => n.id === selection.unionId) ? selection.unionId ?? '' : ''

  const showUnionField = selection.upazilaId != null && unions.length > 0
  const showNoUnionsHint = selection.upazilaId != null && unions.length === 0

  return (
    <div className={className ?? 'grid gap-3 md:grid-cols-2'}>
      <div className="space-y-1">
        <Label className={labelClass}>{t('locationDivision')}</Label>
        <Select
          value={selection.divisionId}
          onValueChange={(id) => id && onChange(applyBangladeshLocationLevelChange(selection, 'division', id))}
          disabled={disabled}
          required={required}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('locationSelectDivision')} />
          </SelectTrigger>
          <SelectContent>
            {divisions.map((node) => (
              <SelectItem key={node.id} value={node.id}>
                {pickBangladeshName(node, locale)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className={labelClass}>{t('locationDistrict')}</Label>
        <Select
          value={districtValue}
          onValueChange={(id) =>
            onChange(applyBangladeshLocationLevelChange(selection, 'district', id || undefined))
          }
          disabled={disabled || !selection.divisionId || districts.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('locationSelectDistrict')} />
          </SelectTrigger>
          <SelectContent>
            {districts.map((node) => (
              <SelectItem key={node.id} value={node.id}>
                {pickBangladeshName(node, locale)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className={labelClass}>{t('locationUpazila')}</Label>
        <Select
          value={upazilaValue}
          onValueChange={(id) =>
            onChange(applyBangladeshLocationLevelChange(selection, 'upazila', id || undefined))
          }
          disabled={disabled || !selection.districtId || upazilas.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('locationSelectUpazila')} />
          </SelectTrigger>
          <SelectContent>
            {upazilas.map((node) => (
              <SelectItem key={node.id} value={node.id}>
                {pickBangladeshName(node, locale)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showUnionField ? (
        <div className="space-y-1">
          <Label className={labelClass}>{t('locationUnion')}</Label>
          <Select
            value={unionValue}
            onValueChange={(id) =>
              onChange(applyBangladeshLocationLevelChange(selection, 'union', id || undefined))
            }
            disabled={disabled || !selection.upazilaId || unions.length === 0}
            required={unionRequired}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('locationSelectUnion')} />
            </SelectTrigger>
            <SelectContent>
              {unions.map((node) => (
                <SelectItem key={node.id} value={node.id}>
                  {formatBangladeshLocationLabel(node, locale, t('locationSyntheticUnionDemoSuffix'))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {showNoUnionsHint ? (
        <p className={compact ? 'col-span-full text-xs text-bazardor-muted' : 'text-sm text-bazardor-muted md:col-span-2'}>
          {t('noUnionsForUpazila')}
        </p>
      ) : null}
    </div>
  )
}

export function defaultBangladeshLocationSelection(divisionId: string): BangladeshLocationSelection {
  return { divisionId }
}
