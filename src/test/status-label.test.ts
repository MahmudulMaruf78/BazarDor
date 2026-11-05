import { describe, expect, it } from 'vitest'
import { statusLabel } from '@/lib/i18n/userFacingText'

describe('statusLabel', () => {
  it('returns Bangla approval status when locale is bn', () => {
    expect(statusLabel('bn', 'approvalStatus', 'approved')).toBe('অনুমোদিত')
  })

  it('falls back to raw status when key is missing', () => {
    expect(statusLabel('en', 'approvalStatus', 'unknown')).toBe('unknown')
  })
})
