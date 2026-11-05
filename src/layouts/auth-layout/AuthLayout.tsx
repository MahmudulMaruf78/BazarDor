import { Outlet, Link, useLocation } from 'react-router-dom'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { AppLogo } from '@/components/common/AppLogo'
import { DemoPrototypeNotice } from '@/components/common/DemoPrototypeNotice'
import { LocaleSwitcher } from '@/components/common/LocaleSwitcher'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { documentTitleKeyForPath } from '@/lib/documentTitle'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function AuthLayout() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  useDocumentTitle(documentTitleKeyForPath(pathname), t)

  return (
    <div className="flex min-h-dvh flex-col bg-bazardor-surface">
      <div className="absolute right-4 top-4 z-10">
        <LocaleSwitcher />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="mb-6 w-full max-w-md space-y-4">
          <AppLogo />
          <DemoPrototypeNotice className="rounded-md" />
        </div>
        <Card className="w-full max-w-md border-border/80 shadow-none">
          <CardHeader className="border-b pb-4">
            <CardTitle>{t('authTitle')}</CardTitle>
            <CardDescription>{t('authDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Outlet />
            <p className="mt-4 text-center text-sm text-bazardor-muted">
              <Link to="/" className="text-bazardor-green underline-offset-4 hover:underline">
                {t('backHome')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
