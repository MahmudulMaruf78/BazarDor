export type AppLocale = 'en' | 'bn'

export function formatDemoNumber(value: number, locale: AppLocale, fractionDigits = 2): string {
  return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value)
}
