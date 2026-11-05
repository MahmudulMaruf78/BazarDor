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
import { MetricTileGrid } from '@/components/common/MetricTileGrid'
import { RoleWorkspaceShell } from '@/components/common/RoleWorkspaceShell'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function AdminDemoPage() {
  const { t, translateError, formatNumber } = useI18n()
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
    <RoleWorkspaceShell role="admin" eyebrow={t('adminBadge')} title={t('adminTitle')} subtitle={t('adminSubtitle')}>
      <Tabs defaultValue="system">
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="system">{t('adminTabSystem')}</TabsTrigger>
          <TabsTrigger value="locations">{t('adminLocationsTitle')}</TabsTrigger>
          <TabsTrigger value="products">{t('adminProductsTitle')}</TabsTrigger>
          <TabsTrigger value="units">{t('adminUnitsTitle')}</TabsTrigger>
          <TabsTrigger value="users">{t('adminUsersTitle')}</TabsTrigger>
          <TabsTrigger value="listings">{t('adminListingsTitle')}</TabsTrigger>
          <TabsTrigger value="docs">{t('adminTabDocs')}</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          <MetricTileGrid
            metrics={[
              {
                label: t('expectedSchema'),
                value: formatNumber(STORAGE_SCHEMA_VERSION, 0),
              },
              {
                label: t('stored'),
                value:
                  storedVersion === null ? '…' : formatNumber(storedVersion ?? 0, 0),
              },
            ]}
          />
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle>{t('storageStatus')}</CardTitle>
              <CardDescription>
                {t('expectedSchema')} v{STORAGE_SCHEMA_VERSION} · {t('stored')}{' '}
                {storedVersion === null ? '…' : storedVersion ?? t('storedNone')}
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
                          toast.error(translateError(result.error.message))
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
        </TabsContent>

        <TabsContent value="locations">
          <Can permission="admin.locations.view">
            <AdminLocationsBrowser />
          </Can>
        </TabsContent>

        <TabsContent value="products">
          <Can permission="admin.products.view">
            <AdminProductsBrowser />
          </Can>
        </TabsContent>

        <TabsContent value="units">
          <Can permission="admin.units.view">
            <AdminUnitsBrowser />
          </Can>
        </TabsContent>

        <TabsContent value="users">
          <Can permission="admin.users.view">
            <AdminUsersBrowser />
          </Can>
        </TabsContent>

        <TabsContent value="listings">
          <Can permission="admin.listings.view">
            <AdminListingsBrowser />
          </Can>
        </TabsContent>

        <TabsContent value="docs">
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle>{t('handoverDocs')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                {t('walkthrough')}:{' '}
                <code className="rounded bg-muted px-1">docs/DEMO_GUIDE.md</code> · {t('qaChecklist')}
              </p>
              <p>
                {t('adminStatusReportLabel')}:{' '}
                <code className="rounded bg-muted px-1">docs/IMPLEMENTATION_STATUS.md</code>
              </p>
              <p className="text-muted-foreground">{t('adminQaCommand')}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </RoleWorkspaceShell>
  )
}
