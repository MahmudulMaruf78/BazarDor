import {
  getBangladeshLocationById,
  getBangladeshLocationParentId,
  type BangladeshLocationSelection,
} from '@/data/bangladeshLocationIndex'

export type LocationValidationResult = { ok: true } | { ok: false; message: string }

export function validateLocationSelection(sel: BangladeshLocationSelection): LocationValidationResult {
  if (!sel.divisionId) {
    return { ok: false, message: 'locationValidationDivisionRequired' }
  }
  const division = getBangladeshLocationById(sel.divisionId)
  if (!division || division.type !== 'division') {
    return { ok: false, message: 'locationValidationInvalidDivision' }
  }

  if (!sel.districtId) {
    return { ok: true }
  }
  const district = getBangladeshLocationById(sel.districtId)
  if (!district || district.type !== 'district') {
    return { ok: false, message: 'locationValidationInvalidDistrict' }
  }
  if (getBangladeshLocationParentId(sel.districtId) !== sel.divisionId) {
    return { ok: false, message: 'locationValidationDistrictParent' }
  }

  if (!sel.upazilaId) {
    return { ok: true }
  }
  const upazila = getBangladeshLocationById(sel.upazilaId)
  if (!upazila || upazila.type !== 'upazila') {
    return { ok: false, message: 'locationValidationInvalidUpazila' }
  }
  if (getBangladeshLocationParentId(sel.upazilaId) !== sel.districtId) {
    return { ok: false, message: 'locationValidationUpazilaParent' }
  }

  if (!sel.unionId) {
    return { ok: true }
  }
  const union = getBangladeshLocationById(sel.unionId)
  if (!union || union.type !== 'union') {
    return { ok: false, message: 'locationValidationInvalidUnion' }
  }
  if (getBangladeshLocationParentId(sel.unionId) !== sel.upazilaId) {
    return { ok: false, message: 'locationValidationUnionParent' }
  }

  return { ok: true }
}

/** Drop child IDs that fail parent-id chain (stale UI state). */
export function sanitizeBangladeshLocationSelection(
  sel: BangladeshLocationSelection,
): BangladeshLocationSelection {
  if (!sel.divisionId) return { divisionId: '' }
  const division = getBangladeshLocationById(sel.divisionId)
  if (!division || division.type !== 'division') return { divisionId: sel.divisionId }

  const base: BangladeshLocationSelection = { divisionId: sel.divisionId }
  if (!sel.districtId || getBangladeshLocationParentId(sel.districtId) !== sel.divisionId) {
    return base
  }
  const withDistrict = { ...base, districtId: sel.districtId }
  if (!sel.upazilaId || getBangladeshLocationParentId(sel.upazilaId) !== sel.districtId) {
    return withDistrict
  }
  const withUpazila = { ...withDistrict, upazilaId: sel.upazilaId }
  if (!sel.unionId || getBangladeshLocationParentId(sel.unionId) !== sel.upazilaId) {
    return withUpazila
  }
  return { ...withUpazila, unionId: sel.unionId }
}

function childAllowed(parentId: string | undefined, childId: string | undefined): boolean {
  if (!childId) return true
  if (!parentId) return false
  return getBangladeshLocationParentId(childId) === parentId
}

/** Cascade reset when a parent level changes (pure, for tests). */
export function applyBangladeshLocationLevelChange(
  prev: BangladeshLocationSelection,
  level: 'division' | 'district' | 'upazila' | 'union',
  value: string | undefined,
): BangladeshLocationSelection {
  if (level === 'division') {
    return sanitizeBangladeshLocationSelection({ divisionId: value ?? prev.divisionId })
  }
  if (level === 'district') {
    if (value && !childAllowed(prev.divisionId, value)) {
      return sanitizeBangladeshLocationSelection({ divisionId: prev.divisionId })
    }
    return sanitizeBangladeshLocationSelection({ divisionId: prev.divisionId, districtId: value })
  }
  if (level === 'upazila') {
    if (value && !childAllowed(prev.districtId, value)) {
      return sanitizeBangladeshLocationSelection({
        divisionId: prev.divisionId,
        districtId: prev.districtId,
      })
    }
    return sanitizeBangladeshLocationSelection({
      divisionId: prev.divisionId,
      districtId: prev.districtId,
      upazilaId: value,
    })
  }
  if (value && !childAllowed(prev.upazilaId, value)) {
    return sanitizeBangladeshLocationSelection({
      divisionId: prev.divisionId,
      districtId: prev.districtId,
      upazilaId: prev.upazilaId,
    })
  }
  return sanitizeBangladeshLocationSelection({
    divisionId: prev.divisionId,
    districtId: prev.districtId,
    upazilaId: prev.upazilaId,
    unionId: value,
  })
}
