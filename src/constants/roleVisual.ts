import type { RoleKey } from '@/constants/roles'

/** Left accent on role workspace headers */
export const ROLE_PAGE_ACCENT: Record<RoleKey, string> = {
  farmer: 'border-l-bazardor-green',
  buyer: 'border-l-[#1e4d8c]',
  seller: 'border-l-bazardor-gold',
  fieldOfficer: 'border-l-[#0f766e]',
  department: 'border-l-bazardor-navy',
  admin: 'border-l-bazardor-muted',
}

export const ROLE_NAV_ACTIVE: Record<RoleKey, string> = {
  farmer: 'bg-bazardor-green/12 font-medium text-bazardor-green',
  buyer: 'bg-[#1e4d8c]/10 font-medium text-[#1e4d8c]',
  seller: 'bg-bazardor-gold/15 font-medium text-[#8a6914]',
  fieldOfficer: 'bg-[#0f766e]/10 font-medium text-[#0f766e]',
  department: 'bg-bazardor-navy/8 font-medium text-bazardor-navy',
  admin: 'bg-muted font-medium text-bazardor-navy',
}
