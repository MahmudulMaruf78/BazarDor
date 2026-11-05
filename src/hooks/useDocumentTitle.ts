import { useEffect } from 'react'
import type { MessageKey } from '@/lib/i18n/messages'

export function useDocumentTitle(titleKey: MessageKey, t: (key: MessageKey) => string) {
  useEffect(() => {
    document.title = `${t(titleKey)} · ${t('docTitleBrand')}`
  }, [titleKey, t])
}
