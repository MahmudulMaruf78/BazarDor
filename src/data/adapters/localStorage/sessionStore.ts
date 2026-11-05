import { LOCAL_STORAGE_KEYS } from '@/constants/storage'
import { demoSessionSchema, preferencesSchema } from '@/schemas/domain'
import type { RoleKey } from '@/constants/roles'
import { err, ok, type RepositoryResult } from '@/types/result'
import { z } from 'zod'

export type DemoSession = {
  userId: string
  role: RoleKey
  signedInAt: string
}

export type Preferences = {
  locale: 'en' | 'bn'
  favoriteListingIds: string[]
}

function readJson(key: string): unknown {
  const raw = localStorage.getItem(key)
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return undefined
  }
}

function writeJson(key: string, value: unknown): RepositoryResult<void> {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return ok(undefined)
  } catch (cause) {
    return err({ code: 'STORAGE', message: 'Could not save demo session data.', details: cause })
  }
}

function parse<T>(schema: z.ZodType<T>, value: unknown, label: string): RepositoryResult<T> {
  const parsed = schema.safeParse(value)
  if (!parsed.success) {
    return err({
      code: 'VALIDATION',
      message: `Invalid ${label} in local storage.`,
      details: parsed.error.flatten(),
    })
  }
  return ok(parsed.data)
}

export const demoSessionStore = {
  get(): RepositoryResult<DemoSession | null> {
    const value = readJson(LOCAL_STORAGE_KEYS.demoSession)
    if (value === undefined) return ok(null)
    const parsed = parse(demoSessionSchema, value, 'demo session')
    return parsed.ok ? ok(parsed.data) : parsed
  },
  set(session: DemoSession): RepositoryResult<void> {
    const validated = parse(demoSessionSchema, session, 'demo session')
    if (!validated.ok) return validated
    return writeJson(LOCAL_STORAGE_KEYS.demoSession, validated.data)
  },
  clear(): RepositoryResult<void> {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.demoSession)
      return ok(undefined)
    } catch (cause) {
      return err({ code: 'STORAGE', message: 'Could not clear demo session.', details: cause })
    }
  },
}

export const preferencesStore = {
  get(): RepositoryResult<Preferences> {
    const value = readJson(LOCAL_STORAGE_KEYS.preferences)
    if (value === undefined) return ok({ locale: 'en', favoriteListingIds: [] })
    const parsed = parse(preferencesSchema, value, 'preferences')
    if (!parsed.ok) return parsed
    return ok({
      locale: parsed.data.locale,
      favoriteListingIds: parsed.data.favoriteListingIds ?? [],
    })
  },
  set(preferences: Preferences): RepositoryResult<void> {
    const validated = parse(preferencesSchema, preferences, 'preferences')
    if (!validated.ok) return validated
    return writeJson(LOCAL_STORAGE_KEYS.preferences, validated.data)
  },
}
