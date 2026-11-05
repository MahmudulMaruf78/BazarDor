import { useI18n } from '@/app/preferences/LocaleProvider'
import { cn } from 'cn'

type LocaleSwitcherProps = {
  className?: string
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const { locale, setLocale, t } = useI18n()
  const isBn = locale === 'bn'

  return (
    <div
      className={cn(
        'relative inline-grid h-9 w-[5.5rem] grid-cols-2 cursor-pointer rounded-full bg-bazardor-green p-0.5 shadow-sm ring-1 ring-bazardor-green/30',
        className,
      )}
      role="group"
      aria-label={t('language')}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-white shadow-sm transition-[left] duration-200 ease-out',
          isBn ? 'left-0.5' : 'left-[calc(50%+1px)]',
        )}
      />
      <button
        type="button"
        className={cn(
          'relative z-10 cursor-pointer rounded-full text-sm font-bold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/80',
          isBn ? 'text-bazardor-green' : 'text-primary-foreground',
        )}
        aria-pressed={isBn}
        onClick={() => setLocale('bn')}
      >
        BN
      </button>
      <button
        type="button"
        className={cn(
          'relative z-10 cursor-pointer rounded-full text-sm font-bold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/80',
          !isBn ? 'text-bazardor-green' : 'text-primary-foreground',
        )}
        aria-pressed={!isBn}
        onClick={() => setLocale('en')}
      >
        EN
      </button>
    </div>
  )
}
