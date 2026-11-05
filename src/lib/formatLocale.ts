import type { MessageKey } from '@/lib/i18n/messages'
import { translate } from '@/lib/i18n/messages'

export type AppLocale = 'en' | 'bn'

export type LocalizedUnit = { code: string; nameEn: string; nameBn: string }

export function formatDemoNumber(value: number, locale: AppLocale, fractionDigits = 2): string {
  return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value)
}

/** Standard formatter for quantities and money amounts in UI. */
export function formatQuantity(value: number, locale: AppLocale, fractionDigits = 2): string {
  return formatDemoNumber(value, locale, fractionDigits)
}

export function formatBdtPerKg(value: number, locale: AppLocale): string {
  return `${formatDemoNumber(value, locale)} ${locale === 'bn' ? 'টাকা/কেজি' : 'BDT/kg'}`
}

export function formatDemoDate(
  iso: string,
  locale: AppLocale,
  style: 'short' | 'medium' = 'short',
): string {
  const parsed = new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso)
  if (Number.isNaN(parsed.getTime())) return iso.slice(0, 10)
  return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
    dateStyle: style,
  }).format(parsed)
}

export function formatUnitLabel(unit: LocalizedUnit, locale: AppLocale): string {
  if (locale === 'bn' && unit.nameBn.trim()) return unit.nameBn
  if (unit.nameEn.trim()) return unit.nameEn
  return unit.code
}

const TREND_GRANULARITY_KEYS: Record<'day' | 'week' | 'month', MessageKey> = {
  day: 'trendDaily',
  week: 'trendWeekly',
  month: 'trendMonthly',
}

export function formatTrendAxisLabel(
  granularity: 'day' | 'week' | 'month',
  isoDate: string,
  locale: AppLocale,
): string {
  const gran = translate(locale, TREND_GRANULARITY_KEYS[granularity])
  return `${gran} · ${formatDemoDate(isoDate.slice(0, 10), locale)}`
}

export const CHART_TICK_FONT_BN = "'Noto Sans Bengali', 'IBM Plex Sans', system-ui, sans-serif"
