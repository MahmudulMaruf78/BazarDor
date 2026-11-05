import { Link, useLocation } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppSelector } from '@/app/store/hooks'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { selectAuthRole, selectAuthSession } from '@/features/auth/authSlice'
import { ROLE_DASHBOARD_PATH } from '@/constants/roles'
import { rolesAllowedForPath } from '@/features/auth/routeAccess'

export function AccessDeniedPage() {
  const role = useAppSelector(selectAuthRole)
  const location = useLocation()
  const allowed = rolesAllowedForPath(location.pathname)
  const { t, roleLabel } = useI18n()

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('accessDeniedDemo')}</CardTitle>
          <CardDescription>{t('accessDeniedBody')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            {t('signedInAsRole')}{' '}
            <span className="font-medium">{role ? roleLabel(role) : t('unknownRole')}</span>.
          </p>
          {allowed ? (
            <p className="text-bazardor-muted">
              {t('allowedRolesHere')}: {allowed.map((r) => roleLabel(r)).join(', ')}
            </p>
          ) : null}
          {role ? (
            <Link to={ROLE_DASHBOARD_PATH[role]} className={buttonVariants({ variant: 'default' })}>
              {t('goMyDashboard')}
            </Link>
          ) : (
            <Link to="/login" className={buttonVariants({ variant: 'default' })}>
              {t('demoSignIn')}
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function NotFoundPage() {
  const session = useAppSelector(selectAuthSession)
  const { t } = useI18n()
  useDocumentTitle('docTitleNotFound', t)

  return (
    <div className="flex min-h-dvh flex-col bg-bazardor-surface">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 px-4 py-10">
        <h1 className="text-2xl font-semibold text-bazardor-navy">{t('notFoundTitle')}</h1>
        <p className="text-sm text-bazardor-muted">{t('notFoundBody')}</p>
        <div className="flex gap-2">
          <Link to="/" className={buttonVariants({ variant: 'outline' })}>
            {t('publicHome')}
          </Link>
          {session ? (
            <Link to={ROLE_DASHBOARD_PATH[session.role]} className={buttonVariants({ variant: 'default' })}>
              {t('myDashboard')}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}
