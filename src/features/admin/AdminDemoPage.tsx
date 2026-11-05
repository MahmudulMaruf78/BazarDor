import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { resetDemoDataset } from '@/app/data/demoDataHooks'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { STORAGE_SCHEMA_VERSION } from '@/constants/storage'
import { Can } from '@/features/auth/Can'
import { AdminListingsBrowser } from '@/features/admin/AdminListingsBrowser'
import { AdminLocationsBrowser } from '@/features/admin/AdminLocationsBrowser'
import { AdminProductsBrowser } from '@/features/admin/AdminProductsBrowser'
import { AdminUnitsBrowser } from '@/features/admin/AdminUnitsBrowser'
import { AdminUsersBrowser } from '@/features/admin/AdminUsersBrowser'
import { readStorageSchemaVersion } from '@/data/bootstrap/demoDataLifecycle'
import { PageHeader } from '@/components/common/PageHeader'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AdminDemoPage() {
  const { t } = useI18n()
  const [storedVersion, setStoredVersion] = useState<number | null>(null)
  const [resetting, setResetting] = useState(false)

  const reload = useCallback(() => {
    void readStorageSchemaVersion().then((result) => {
      if (result.ok) setStoredVersion(result.data)
    })
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('adminBadge')}
        title={t('adminTitle')}
        subtitle={t('adminSubtitle')}
        role="admin"
      />

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

      <Can permission="admin.locations.view">
        <AdminLocationsBrowser />
      </Can>

      <Can permission="admin.products.view">
        <AdminProductsBrowser />
      </Can>

      <Can permission="admin.units.view">
        <AdminUnitsBrowser />
      </Can>

      <Can permission="admin.users.view">
        <AdminUsersBrowser />
      </Can>

      <Can permission="admin.listings.view">
        <AdminListingsBrowser />
      </Can>

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
