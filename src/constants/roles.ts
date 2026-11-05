export const ROLES = [
  'farmer',
  'buyer',
  'seller',
  'fieldOfficer',
  'department',
  'admin',
] as const

export type RoleKey = (typeof ROLES)[number]

export const ROLE_LABELS: Record<RoleKey, { en: string; bn: string }> = {
  farmer: { en: 'Farmer', bn: 'কৃষক' },
  buyer: { en: 'Buyer', bn: 'ক্রেতা' },
  seller: { en: 'Seller / Trader', bn: 'বিক্রেতা' },
  fieldOfficer: { en: 'Field Officer', bn: 'মাঠ কর্মকর্তা' },
  department: { en: 'Agriculture Department', bn: 'কৃষি বিভাগ' },
  admin: { en: 'Admin', bn: 'অ্যাডমিন' },
}

export const ROLE_DASHBOARD_PATH: Record<RoleKey, string> = {
  farmer: '/farmer',
  buyer: '/buyer',
  seller: '/seller',
  fieldOfficer: '/field-officer',
  department: '/department',
  admin: '/admin',
}
