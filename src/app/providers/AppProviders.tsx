import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { LocaleProvider, useI18n } from '@/app/preferences/LocaleProvider'
import { useDemoDataBootstrap } from '@/app/data/demoDataHooks'
import { useAppDispatch } from '@/app/store/hooks'
import { store } from '../store'
import { hydrateAuth } from '@/features/auth/authSlice'

function DemoDataGate({ children }: PropsWithChildren) {
  const init = useDemoDataBootstrap()

  if (init.status === 'loading' || init.status === 'idle') {
    return <DemoDataLoading />
  }

  if (init.status === 'error') {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 text-sm text-destructive">
        {init.message}
      </div>
    )
  }

  return children
}

function DemoDataLoading() {
  const { t } = useI18n()
  return (
    <div className="flex min-h-dvh items-center justify-center p-6 text-sm text-bazardor-muted">
      {t('loadingDataset')}
    </div>
  )
}

function AuthHydrator({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    void dispatch(hydrateAuth())
  }, [dispatch])

  return children
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <LocaleProvider>
        <DemoDataGate>
          <AuthHydrator>{children}</AuthHydrator>
        </DemoDataGate>
      </LocaleProvider>
      <Toaster position="top-center" richColors closeButton />
    </Provider>
  )
}
