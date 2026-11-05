import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { AppLogo } from '@/components/common/AppLogo'
import { LocaleSwitcher } from '@/components/common/LocaleSwitcher'
import { buttonVariants } from '@/components/ui/button'
import { cn } from 'cn'
import { documentTitleKeyForPath } from '@/lib/documentTitle'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function PublicLayout() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  useDocumentTitle(documentTitleKeyForPath(pathname), t)
  const isHome = pathname === '/'
  const isProductDetail = pathname.startsWith('/product/')
  const shellMax = isProductDetail ? 'max-w-[90rem]' : 'max-w-6xl'

  return (
    <div
      className={cn(
        'flex min-h-dvh flex-col overflow-x-clip',
        isHome
          ? 'bg-gradient-to-b from-primary/12 via-secondary/35 to-background'
          : 'bg-background',
      )}
    >
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b',
          isHome
            ? 'border-primary/20 bg-primary/[0.07] backdrop-blur-md'
            : 'border-border bg-card/95 backdrop-blur-md',
        )}
      >
        <div className={cn('mx-auto flex items-center justify-between gap-4 px-4 py-3', shellMax)}>
          <AppLogo />
          <nav className="flex flex-wrap items-center gap-2" aria-label={t('publicNavLabel')}>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  isActive &&
                    (isHome ? 'bg-primary/15 font-medium text-primary' : 'bg-muted font-medium'),
                )
              }
            >
              {t('docTitleHome')}
            </NavLink>
            <NavLink
              to="/explore"
              className={({ isActive }) =>
                cn(buttonVariants({ variant: 'ghost', size: 'sm' }), isActive && 'bg-muted font-medium')
              }
            >
              {t('publicExploreNav')}
            </NavLink>
            <LocaleSwitcher />
            <Link to="/login" className={buttonVariants({ variant: 'default', size: 'sm' })}>
              {t('demoSignIn')}
            </Link>
          </nav>
        </div>
      </header>
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <Outlet />
      </main>
      <footer
        className={cn(
          'border-t px-4 py-5 text-center text-xs text-muted-foreground',
          isHome ? 'border-primary/15 bg-primary/[0.05]' : 'border-border bg-card',
        )}
      >
        {t('layoutFooter')}
      </footer>
    </div>
  )
}
