import { describe, expect, it } from 'vitest'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'
import {
  applyBangladeshLocationLevelChange,
  validateLocationSelection,
} from '@/services/bangladeshLocationValidation'

describe('validateLocationSelection', () => {
  it('accepts demo corridor selection', () => {
    const result = validateLocationSelection({
      divisionId: D.divisionKhulna,
      districtId: D.districtJashore,
      upazilaId: D.upazilaKeshabpur,
      unionId: D.unionGhona,
    })
    expect(result).toEqual({ ok: true })
  })

  it('rejects district under wrong division', () => {
    const result = validateLocationSelection({
      divisionId: D.divisionKhulna,
      districtId: 'bd-dist-dhaka-dhaka',
    })
    expect(result.ok).toBe(false)
  })

  it('clears child levels when division changes', () => {
    const next = applyBangladeshLocationLevelChange(
      {
        divisionId: D.divisionKhulna,
        districtId: D.districtJashore,
        upazilaId: D.upazilaKeshabpur,
      },
      'division',
      'bd-div-dhaka',
    )
    expect(next).toEqual({ divisionId: 'bd-div-dhaka' })
  })
})
