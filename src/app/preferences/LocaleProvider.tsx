import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react'
import { dataLayer } from '@/data'
import type { AppLocale } from '@/lib/formatLocale'
import { formatDemoNumber } from '@/lib/formatLocale'
import { type MessageKey, translate } from '@/lib/i18n/messages'
import { ROLE_LABELS, type RoleKey } from '@/constants/roles'

type LocalizedName = { nameEn: string; nameBn: string }

import { translateUserError } from '@/lib/i18n/userFacingText'

type I18nContextValue = {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
  t: (key: MessageKey) => string
  translateError: (message: string) => string
  formatNumber: (value: number, fractionDigits?: number) => string
  pickName: (record: LocalizedName) => string
  roleLabel: (role: RoleKey) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function LocaleProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<AppLocale>(() => {
    const current = dataLayer.preferences.get()
    return current.ok ? current.data.locale : 'en'
  })

  const setLocale = useCallback((next: AppLocale) => {
    const current = dataLayer.preferences.get()
    if (!current.ok) return
    const saved = dataLayer.preferences.set({ ...current.data, locale: next })
    if (saved.ok) setLocaleState(next)
  }, [])

  const value = useMemo<I18nContextValue>(() => {
    const t = (key: MessageKey) => translate(locale, key)
    return {
      locale,
      setLocale,
      t,
      translateError: (message) => translateUserError(message, locale),
      formatNumber: (value, fractionDigits) => formatDemoNumber(value, locale, fractionDigits),
      pickName: (record) => (locale === 'bn' ? record.nameBn : record.nameEn),
      roleLabel: (role) => ROLE_LABELS[role][locale === 'bn' ? 'bn' : 'en'],
    }
  }, [locale, setLocale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within LocaleProvider')
  return ctx
}

/** @deprecated use useI18n */
export function useLocalePreference() {
  const { locale, setLocale } = useI18n()
  return { locale, setLocale }
}

export function useOptionalI18n(): I18nContextValue | null {
  return useContext(I18nContext)
}
