import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/app/store/hooks'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { selectAuthSession, selectAuthStatus } from '@/features/auth/authSlice'
import { ROLE_DASHBOARD_PATH } from '@/constants/roles'

export function RequireAuth() {
  const status = useAppSelector(selectAuthStatus)
  const session = useAppSelector(selectAuthSession)
  const location = useLocation()
  const { t } = useI18n()

  if (status === 'unknown') {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 text-sm text-muted-foreground">
        {t('checkingSession')}
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function RedirectIfAuthenticated() {
  const status = useAppSelector(selectAuthStatus)
  const session = useAppSelector(selectAuthSession)
  const { t } = useI18n()

  if (status === 'unknown') {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
        {t('loading')}
      </div>
    )
  }

  if (session) {
    return <Navigate to={ROLE_DASHBOARD_PATH[session.role]} replace />
  }

  return <Outlet />
}
