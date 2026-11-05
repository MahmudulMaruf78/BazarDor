/** Bangla display overrides by BazarDor location id (Phase 9 incremental). */
export const BN_OVERRIDES_BY_ID = {
  'bd-div-khulna': 'খুলনা বিভাগ',
  'bd-div-dhaka': 'ঢাকা বিভাগ',
  'bd-div-chattogram': 'চট্টগ্রাম বিভাগ',
  'bd-div-rajshahi': 'রাজশাহী বিভাগ',
  'bd-div-rangpur': 'রংপুর বিভাগ',
  'bd-div-sylhet': 'সিলেট বিভাগ',
  'bd-div-mymensingh': 'ময়মনসিংহ বিভাগ',
  'bd-div-barishal': 'বরিশাল বিভাগ',
  'bd-dist-khulna-jashore': 'যশোর জেলা',
  'bd-upz-khulna-jashore-keshabpur': 'কেশবপুর উপজেলা',
  'bd-upz-khulna-jashore-monirampur': 'মণিরামপুর উপজেলা',
}

export function resolveBanglaName(nodeId, fallback) {
  return BN_OVERRIDES_BY_ID[nodeId] ?? fallback
}
