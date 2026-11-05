import { describe, expect, it } from 'vitest'
import {
  getBangladeshChildren,
  getBangladeshLocationParentId,
  isBangladeshLocationChildOf,
} from '@/data/bangladeshLocationIndex'
import {
  applyBangladeshLocationLevelChange,
  sanitizeBangladeshLocationSelection,
} from '@/services/bangladeshLocationValidation'

const DHAKA_DIV = 'bd-div-dhaka'
const RAJSHAHI_DIV = 'bd-div-rajshahi'
const NATORE_DIST = 'bd-dist-rajshahi-natore'
const SINGRA_UPZ = 'bd-upz-rajshahi-natore-singra'

describe('hierarchical location options (ID parent chain)', () => {
  it('Dhaka division districts exclude Natore (Rajshahi)', () => {
    const districts = getBangladeshChildren(DHAKA_DIV)
    expect(districts.length).toBeGreaterThan(0)
    expect(districts.every((d) => isBangladeshLocationChildOf(d.id, DHAKA_DIV))).toBe(true)
    expect(districts.some((d) => d.id === NATORE_DIST)).toBe(false)
  })

  it('Natore district lists Singra upazila only under Natore id', () => {
    const upazilas = getBangladeshChildren(NATORE_DIST)
    expect(upazilas.some((u) => u.id === SINGRA_UPZ)).toBe(true)
    expect(getBangladeshLocationParentId(SINGRA_UPZ)).toBe(NATORE_DIST)
    expect(upazilas.every((u) => isBangladeshLocationChildOf(u.id, NATORE_DIST))).toBe(true)
  })

  it('Singra upazila unions are only direct children by id', () => {
    const unions = getBangladeshChildren(SINGRA_UPZ)
    for (const u of unions) {
      expect(getBangladeshLocationParentId(u.id)).toBe(SINGRA_UPZ)
    }
  })

  it('sanitize drops cross-division stale district (Dhaka + Natore)', () => {
    const cleaned = sanitizeBangladeshLocationSelection({
      divisionId: DHAKA_DIV,
      districtId: NATORE_DIST,
      upazilaId: SINGRA_UPZ,
    })
    expect(cleaned).toEqual({ divisionId: DHAKA_DIV })
  })

  it('division change clears Rajshahi district chain', () => {
    const next = applyBangladeshLocationLevelChange(
      {
        divisionId: RAJSHAHI_DIV,
        districtId: NATORE_DIST,
        upazilaId: SINGRA_UPZ,
      },
      'division',
      DHAKA_DIV,
    )
    expect(next).toEqual({ divisionId: DHAKA_DIV })
  })

  it('rejects district pick not under selected division', () => {
    const next = applyBangladeshLocationLevelChange({ divisionId: DHAKA_DIV }, 'district', NATORE_DIST)
    expect(next).toEqual({ divisionId: DHAKA_DIV })
  })
})
