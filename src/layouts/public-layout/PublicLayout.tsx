import { Link, Outlet } from 'react-router-dom'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { AppLogo } from '@/components/common/AppLogo'
import { LocaleSwitcher } from '@/components/common/LocaleSwitcher'
import { buttonVariants } from '@/components/ui/button'

export function PublicLayout() {
  const { t } = useI18n()

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <AppLogo />
          <nav className="flex items-center gap-2" aria-label={t('publicNavLabel')}>
            <LocaleSwitcher />
            <Link to="/login" className={buttonVariants({ variant: 'ghost' })}>
              {t('demoSignIn')}
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-bazardor-green/5">
        <Outlet />
      </main>
      <footer className="border-t bg-white px-4 py-6 text-center text-sm text-bazardor-muted">
        {t('layoutFooter')}
      </footer>
    </div>
  )
}
