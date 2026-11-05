import { Bell, LogOut, Menu } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
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
import { ROLE_MAIN_BG, ROLE_NAV_ACTIVE, ROLE_SIDEBAR_BAR } from '@/constants/roleVisual'
import { notificationDisplayText } from '@/lib/i18n/userFacingText'
import { documentTitleKeyForPath } from '@/lib/documentTitle'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const sessionRole = useAppSelector(selectAuthRole)
  const { t, roleLabel } = useI18n()

  return (
    <nav className="flex flex-col gap-0.5 px-2 py-2" aria-label={t('navLabel')}>
      {ROLES.filter((role) => (sessionRole ? canRoleAccessPath(sessionRole, ROLE_DASHBOARD_PATH[role]) : false)).map(
        (role) => (
          <NavLink
            key={role}
            to={ROLE_DASHBOARD_PATH[role]}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-2 text-sm transition-colors',
                isActive ? ROLE_NAV_ACTIVE[role] : 'text-foreground hover:bg-muted/80',
              )
            }
          >
            {({ isActive }) => <span aria-current={isActive ? 'page' : undefined}>{roleLabel(role)}</span>}
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
  const { pathname } = useLocation()
  const session = useAppSelector(selectAuthSession)
  const displayName = useAppSelector(selectAuthDisplayName)
  const role = useAppSelector(selectAuthRole)
  const { t, roleLabel, locale, translateError } = useI18n()
  useDocumentTitle(documentTitleKeyForPath(pathname), t)

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
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <div className="flex flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-border/80 bg-card md:block">
          {role ? <div className={cn('h-1 w-full', ROLE_SIDEBAR_BAR[role])} aria-hidden /> : null}
          <div className="border-b border-border/80 px-4 py-4">
            <AppLogo compact />
            {role ? (
              <p className="mt-2 text-xs text-muted-foreground">{roleLabel(role)}</p>
            ) : null}
          </div>
          <SidebarNav />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button variant="outline" size="icon" aria-label={t('openNav')}>
                    <Menu className="size-4" aria-hidden />
                  </Button>
                }
              />
              <SheetContent side="left" className="flex w-72 flex-col p-0">
                <SheetHeader className="border-b p-4 text-left">
                  <SheetTitle>{t('myDashboard')}</SheetTitle>
                </SheetHeader>
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                  <SidebarNav onNavigate={() => setMobileOpen(false)} />
                </div>
                <div className="mt-auto space-y-2 border-t border-border p-4">
                  <Link
                    to="/"
                    className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'w-full justify-start' })}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t('publicHome')}
                  </Link>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start gap-1"
                    onClick={() => {
                      setMobileOpen(false)
                      void dispatch(signOutDemo())
                        .unwrap()
                        .then(() => {
                          toast.message(t('signedOut'))
                          navigate('/login', { replace: true })
                        })
                        .catch((error: Error) => toast.error(translateError(error.message)))
                    }}
                  >
                    <LogOut className="size-4" aria-hidden />
                    {t('signOut')}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <AppLogo compact />
            <LocaleSwitcher className="ml-auto" />
          </header>

          <header className="hidden items-center justify-between gap-4 border-b border-border/80 bg-card px-6 py-3 md:flex">
            <div>
              <p className="text-sm font-medium text-foreground">{displayName ?? t('demoUser')}</p>
              <p className="text-xs text-muted-foreground">
                {role ? roleLabel(role) : t('role')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <LocaleSwitcher />
              <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setNotifOpen(true)}>
                  <Bell className="size-4" aria-hidden />
                  {t('notifications')}
                  {unreadCount > 0 ? (
                    <Badge variant="secondary" className="min-w-5 justify-center px-1.5">
                      {unreadCount}
                    </Badge>
                  ) : null}
                </Button>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t('notifications')}</DialogTitle>
                    <DialogDescription>{t('notificationsSample')}</DialogDescription>
                  </DialogHeader>
                  <ul className="max-h-80 space-y-2 overflow-y-auto text-sm">
                    {notifications.length === 0 ? (
                      <li className="text-muted-foreground">{t('noNotifications')}</li>
                    ) : (
                      notifications.map((item) => {
                        const copy = notificationDisplayText(item, locale)
                        return (
                        <li key={item.id} className="rounded-md border p-2">
                          <p className="font-medium">{copy.title}</p>
                          <p className="text-muted-foreground">{copy.body}</p>
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
                            <p className="mt-1 text-xs text-muted-foreground">{t('read')}</p>
                          )}
                        </li>
                        )
                      })
                    )}
                  </ul>
                </DialogContent>
              </Dialog>
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
                    .catch((error: Error) => toast.error(translateError(error.message)))
                }}
              >
                <LogOut className="size-4" aria-hidden />
                {t('signOut')}
              </Button>
            </div>
          </header>

          <main className={cn('flex-1 overflow-x-clip p-4 md:p-6', role ? ROLE_MAIN_BG[role] : 'bg-background')}>
            <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-4">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
