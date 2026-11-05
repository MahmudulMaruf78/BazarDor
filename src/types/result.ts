export type RepositoryErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'FORBIDDEN'
  | 'STORAGE'
  | 'CONFLICT'
  | 'UNKNOWN'

export type RepositoryError = {
  code: RepositoryErrorCode
  message: string
  details?: unknown
}

export type RepositoryResult<T> = { ok: true; data: T } | { ok: false; error: RepositoryError }

export function ok<T>(data: T): RepositoryResult<T> {
  return { ok: true, data }
}

export function err<T>(error: RepositoryError): RepositoryResult<T> {
  return { ok: false, error }
}
