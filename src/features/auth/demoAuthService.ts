import { dataLayer } from '@/data'
import type { DemoSession } from '@/data/adapters/localStorage/sessionStore'
import { ok, type RepositoryResult } from '@/types/result'

export async function readDemoSession(): Promise<RepositoryResult<DemoSession | null>> {
  return dataLayer.session.get()
}

export async function signInDemoUser(userId: string): Promise<RepositoryResult<DemoSession>> {
  const userResult = await dataLayer.repos.users.getUserById(userId)
  if (!userResult.ok) return userResult

  const session: DemoSession = {
    userId: userResult.data.id,
    role: userResult.data.role,
    signedInAt: new Date().toISOString(),
  }

  const saved = dataLayer.session.set(session)
  if (!saved.ok) return saved

  return ok(session)
}

export async function signOutDemoUser(): Promise<RepositoryResult<void>> {
  return dataLayer.session.clear()
}

export async function resolveDemoDisplayName(userId: string): Promise<string> {
  const user = await dataLayer.repos.users.getUserById(userId)
  return user.ok ? user.data.displayName : 'Demo user'
}
