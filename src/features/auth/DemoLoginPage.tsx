import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppDispatch } from '@/app/store/hooks'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { signInDemo } from '@/features/auth/authSlice'
import { dataLayer } from '@/data'
import type { User } from '@/types/domain/records'
import { ROLE_DASHBOARD_PATH } from '@/constants/roles'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function DemoLoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { t, roleLabel, translateError } = useI18n()
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(true)

  useEffect(() => {
    void dataLayer.repos.users.listUsers().then((result) => {
      if (!result.ok) {
        toast.error(translateError(result.error.message))
        setLoadingUsers(false)
        return
      }
      setUsers(result.data)
      setSelectedUserId(result.data[0]?.id ?? '')
      setLoadingUsers(false)
    })
  }, [])

  const fromPath =
    (location.state as { from?: string } | null)?.from &&
    (location.state as { from?: string }).from !== '/login'
      ? (location.state as { from: string }).from
      : undefined

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{t('pickAccount')}</p>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (!selectedUserId) return
          void dispatch(signInDemo(selectedUserId))
            .unwrap()
            .then((payload) => {
              toast.success(`${t('signedInAs')} ${payload.displayName}`)
              const role = payload.session.role
              navigate(fromPath && fromPath.startsWith('/') ? fromPath : ROLE_DASHBOARD_PATH[role], {
                replace: true,
              })
            })
            .catch((error: Error) => toast.error(translateError(error.message)))
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="demo-user">{t('demoAccount')}</Label>
          <Select
            value={selectedUserId}
            onValueChange={(value) => setSelectedUserId(value ?? '')}
            disabled={loadingUsers || users.length === 0}
          >
            <SelectTrigger id="demo-user" className="w-full">
              <SelectValue placeholder={loadingUsers ? t('loadingUsers') : t('selectUser')} />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.displayName} — {roleLabel(user.role)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full" disabled={!selectedUserId}>
          {t('continueDemo')}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground">{t('sessionNote')}</p>
    </div>
  )
}
