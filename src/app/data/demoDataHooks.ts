import { useEffect, useState } from 'react'
import { dataLayer, getHomeOverview, type HomeOverview } from '@/data'

type InitState =
  | { status: 'idle' | 'loading' }
  | { status: 'ready' }
  | { status: 'error'; message: string }

export function useDemoDataBootstrap() {
  const [initState, setInitState] = useState<InitState>({ status: 'idle' })

  useEffect(() => {
    let cancelled = false
    setInitState({ status: 'loading' })
    void dataLayer.initialize().then((result) => {
      if (cancelled) return
      if (!result.ok) {
        setInitState({ status: 'error', message: result.error.message })
        return
      }
      setInitState({ status: 'ready' })
    })
    return () => {
      cancelled = true
    }
  }, [])

  return initState
}

export function useHomeOverview(enabled: boolean) {
  const [overview, setOverview] = useState<HomeOverview | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    void getHomeOverview().then((result) => {
      if (!result.ok) {
        setError(result.error.message)
        setOverview(null)
        return
      }
      setError(null)
      setOverview(result.data)
    })
  }, [enabled])

  return { overview, error }
}

export async function resetDemoDataset() {
  return dataLayer.reset()
}
