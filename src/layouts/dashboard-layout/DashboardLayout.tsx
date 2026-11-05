import { Bell, LogOut, Menu, UserRound } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { signOutDemo, selectAuthDisplayName, selectAuthRole, selectAuthSession } from '@/features/auth/authSlice'
import { canRoleAccessPath } from '@/features/auth/routeAccess'
import {
  listNotificationsForUser,
  markNotificationRead,
} from '@/features/notifications/notificationService'
import type { Notification } from '@/types/domain/records'
import { AppLogo } from '@/components/common/AppLogo'
import { LocaleSwitcher } from '@/components/common/LocaleSwitcher'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { cn } from 'cn'
import { toast } from 'sonner'
import { ROLE_DASHBOARD_PATH, ROLES } from '@/constants/roles'
import { notificationDisplayText } from '@/lib/i18n/userFacingText'

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const sessionRole = useAppSelector(selectAuthRole)
  const { t, roleLabel } = useI18n()

  return (
    <nav className="flex flex-col gap-1 p-2" aria-label={t('navLabel')}>
      {ROLES.filter((role) => (sessionRole ? canRoleAccessPath(sessionRole, ROLE_DASHBOARD_PATH[role]) : false)).map(
        (role) => (
          <NavLink
            key={role}
            to={ROLE_DASHBOARD_PATH[role]}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-bazardor-green/15 font-medium text-bazardor-green'
                  : 'text-bazardor-navy hover:bg-muted',
              )
            }
          >
            {roleLabel(role)}
          </NavLink>
        ),
      )}
    </nav>
  )
}

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const session = useAppSelector(selectAuthSession)
  const displayName = useAppSelector(selectAuthDisplayName)
  const role = useAppSelector(selectAuthRole)
  const { t, roleLabel, locale, translateError } = useI18n()

  const refreshNotifications = useCallback(() => {
    if (!session) return
    void listNotificationsForUser(session.userId).then((result) => {
      if (!result.ok) return
      setNotifications(result.data)
      setUnreadCount(result.data.filter((n) => !n.read).length)
    })
  }, [session])

  useEffect(() => {
    refreshNotifications()
  }, [refreshNotifications])

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r bg-white md:block">
          <div className="border-b p-4">
            <AppLogo compact />
          </div>
          <SidebarNav />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b bg-white px-4 py-3 md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger>
                <Button variant="outline" size="icon" aria-label={t('openNav')}>
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="border-b p-4 text-left">
                  <SheetTitle>{t('myDashboard')}</SheetTitle>
                </SheetHeader>
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <AppLogo compact />
            <LocaleSwitcher className="ml-auto" />
          </header>

          <header className="hidden items-center justify-between gap-4 border-b bg-white px-6 py-3 md:flex">
            <div>
              <p className="text-sm font-medium">{displayName ?? t('demoUser')}</p>
              <p className="text-xs text-bazardor-muted">
                {role ? roleLabel(role) : t('role')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <LocaleSwitcher />
              <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setNotifOpen(true)}>
                  <Bell className="size-4" aria-hidden />
                  {t('notifications')}
                  {unreadCount > 0 ? <Badge variant="secondary">{unreadCount}</Badge> : null}
                </Button>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t('notifications')}</DialogTitle>
                    <DialogDescription>{t('notificationsSample')}</DialogDescription>
                  </DialogHeader>
                  <ul className="max-h-80 space-y-2 overflow-y-auto text-sm">
                    {notifications.length === 0 ? (
                      <li className="text-bazardor-muted">{t('noNotifications')}</li>
                    ) : (
                      notifications.map((item) => {
                        const copy = notificationDisplayText(item, locale)
                        return (
                        <li key={item.id} className="rounded-md border p-2">
                          <p className="font-medium">{copy.title}</p>
                          <p className="text-bazardor-muted">{copy.body}</p>
                          {!item.read ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="mt-2"
                              onClick={() => {
                                void markNotificationRead(item.id).then((result) => {
                                  if (!result.ok) return toast.error(translateError(result.error.message))
                                  refreshNotifications()
                                })
                              }}
                            >
                              {t('markRead')}
                            </Button>
                          ) : (
                            <p className="mt-1 text-xs text-bazardor-muted">{t('read')}</p>
                          )}
                        </li>
                        )
                      })
                    )}
                  </ul>
                </DialogContent>
              </Dialog>
              <div className="flex items-center gap-2 rounded-lg border px-2 py-1">
                <UserRound className="size-4 text-bazardor-muted" aria-hidden />
                <span className="text-sm">{displayName ?? t('demoUser')}</span>
              </div>
              <Link to="/" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                {t('publicHome')}
              </Link>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1"
                onClick={() => {
                  void dispatch(signOutDemo())
                    .unwrap()
                    .then(() => {
                      toast.message(t('signedOut'))
                      navigate('/login', { replace: true })
                    })
                    .catch((error: Error) => toast.error(error.message))
                }}
              >
                <LogOut className="size-4" aria-hidden />
                {t('signOut')}
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
