export type ServiceErrorCode = 'VALIDATION' | 'FORBIDDEN' | 'CONFLICT' | 'INSUFFICIENT_DATA'

export type ServiceError = {
  code: ServiceErrorCode
  message: string
  details?: unknown
}

export type ServiceResult<T> = { ok: true; data: T } | { ok: false; error: ServiceError }

export function serviceOk<T>(data: T): ServiceResult<T> {
  return { ok: true, data }
}

export function serviceErr<T>(error: ServiceError): ServiceResult<T> {
  return { ok: false, error }
}

/** Configurable prototype default — open decision in Master Plan. */
export const DEFAULT_FRESHNESS_HOURS = 24

export type OfficialAverageSuccess = {
  status: 'calculated'
  averagePricePerKg: number
  sampleCount: number
  productId: string
  locationScopeId: string
  windowStart: string
  windowEnd: string
  calculatedAt: string
}

export type OfficialAverageInsufficient = {
  status: 'insufficient_data'
  sampleCount: number
  distinctFarmerCount: number
  productId: string
  locationScopeId: string
  windowStart: string
  windowEnd: string
  calculatedAt: string
}

export type OfficialAverageResult = OfficialAverageSuccess | OfficialAverageInsufficient

export type MarketAverageQuery = {
  productId: string
  locationScopeId: string
  windowStart: string
  windowEnd: string
  calculatedAt: string
}

export type AnomalyThresholdConfig = {
  /** ponytail: no threshold => no automatic anomaly flag from this service */
  maxDeviationPercent?: number
}
