import { Link, Outlet, useLocation } from 'react-router-dom'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { DemoPrototypeNotice } from '@/components/common/DemoPrototypeNotice'
import { AppLogo } from '@/components/common/AppLogo'
import { LocaleSwitcher } from '@/components/common/LocaleSwitcher'
import { buttonVariants } from '@/components/ui/button'
import { documentTitleKeyForPath } from '@/lib/documentTitle'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function PublicLayout() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  useDocumentTitle(documentTitleKeyForPath(pathname), t)

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <AppLogo />
          <nav className="flex items-center gap-2" aria-label={t('publicNavLabel')}>
            <LocaleSwitcher />
            <Link to="/login" className={buttonVariants({ variant: 'default', size: 'sm' })}>
              {t('demoSignIn')}
            </Link>
          </nav>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-3">
          <DemoPrototypeNotice className="rounded-md" />
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-white px-4 py-5 text-center text-xs text-bazardor-muted">
        {t('layoutFooter')}
      </footer>
    </div>
  )
}
