import { Outlet, Link } from 'react-router-dom'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { AppLogo } from '@/components/common/AppLogo'
import { LocaleSwitcher } from '@/components/common/LocaleSwitcher'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthLayout() {
  const { t } = useI18n()

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="absolute right-4 top-4 z-10">
        <LocaleSwitcher />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="mb-6">
          <AppLogo />
        </div>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('authTitle')}</CardTitle>
            <CardDescription>{t('authDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
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
