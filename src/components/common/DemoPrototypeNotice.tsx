import { useI18n } from '@/app/preferences/LocaleProvider'
import { cn } from 'cn'

type DemoPrototypeNoticeProps = {
  className?: string
}

export function DemoPrototypeNotice({ className }: DemoPrototypeNoticeProps) {
  const { t } = useI18n()

  return (
    <p
      className={cn(
        'border border-border/80 bg-white px-3 py-2 text-xs leading-snug text-bazardor-muted',
        className,
      )}
      role="note"
    >
      {t('demoPrototypeNotice')}
    </p>
  )
}
