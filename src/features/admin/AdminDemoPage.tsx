import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { resetDemoDataset } from '@/app/data/demoDataHooks'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { STORAGE_SCHEMA_VERSION } from '@/constants/storage'
import { ROLE_DASHBOARD_PATH } from '@/constants/roles'
import { Can } from '@/features/auth/Can'
import { dataLayer } from '@/data'
import { readStorageSchemaVersion } from '@/data/bootstrap/demoDataLifecycle'
import type { User } from '@/types/domain/records'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function AdminDemoPage() {
  const { t, roleLabel } = useI18n()
  const [users, setUsers] = useState<User[]>([])
  const [storedVersion, setStoredVersion] = useState<number | null>(null)
  const [resetting, setResetting] = useState(false)

  const reload = useCallback(() => {
    void dataLayer.repos.users.listUsers().then((result) => {
      if (result.ok) setUsers(result.data)
    })
    void readStorageSchemaVersion().then((result) => {
      if (result.ok) setStoredVersion(result.data)
    })
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return (
    <div className="space-y-4">
      <Badge variant="secondary">{t('adminBadge')}</Badge>
      <h1 className="text-2xl font-semibold">{t('adminTitle')}</h1>
      <p className="text-sm text-bazardor-muted">{t('adminSubtitle')}</p>

      <Card>
        <CardHeader>
          <CardTitle>{t('storageStatus')}</CardTitle>
          <CardDescription>
            {t('expectedSchema')} v{STORAGE_SCHEMA_VERSION} · {t('stored')}{' '}
            {storedVersion === null ? '…' : storedVersion ?? 'none'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Can permission="admin.demo.reset">
            <Button
              type="button"
              disabled={resetting}
              onClick={() => {
                setResetting(true)
                void resetDemoDataset()
                  .then((result) => {
                    if (!result.ok) {
                      toast.error(result.error.message)
                      return
                    }
                    toast.success(t('resetDemoSuccess'))
                    reload()
                  })
                  .finally(() => setResetting(false))
              }}
            >
              {resetting ? t('resetting') : t('resetDemoDataset')}
            </Button>
          </Can>
          <Link to="/login" className={buttonVariants({ variant: 'outline' })}>
            {t('demoSignIn')}
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('demoAccounts')}</CardTitle>
          <CardDescription>{t('loginPicker')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('displayName')}</TableHead>
                <TableHead>{t('role')}</TableHead>
                <TableHead>{t('dashboard')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.displayName}</TableCell>
                  <TableCell>{roleLabel(user.role)}</TableCell>
                  <TableCell>
                    <Link className="text-sm underline" to={ROLE_DASHBOARD_PATH[user.role]}>
                      {ROLE_DASHBOARD_PATH[user.role]}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('handoverDocs')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            {t('qaChecklist')}:{' '}
            <code className="rounded bg-muted px-1">documentations/PHASE8_QA_CHECKLIST.md</code>
          </p>
          <p>
            {t('walkthrough')}:{' '}
            <code className="rounded bg-muted px-1">documentations/DEMO_WALKTHROUGH.md</code>
          </p>
          <p className="text-bazardor-muted">npm run qa</p>
        </CardContent>
      </Card>
    </div>
  )
}
