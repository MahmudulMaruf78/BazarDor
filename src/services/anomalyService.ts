import type { AnomalyThresholdConfig } from './types'

export function shouldFlagAnomaly(
  normalizedPricePerKg: number,
  referenceAveragePerKg: number | undefined,
  config: AnomalyThresholdConfig,
): boolean {
  if (config.maxDeviationPercent === undefined) return false
  if (referenceAveragePerKg === undefined || referenceAveragePerKg <= 0) return false

  const deviation = (Math.abs(normalizedPricePerKg - referenceAveragePerKg) / referenceAveragePerKg) * 100
  return deviation > config.maxDeviationPercent
}
