import type { RoleKey } from '@/constants/roles'

/** Left accent on role workspace headers */
export const ROLE_PAGE_ACCENT: Record<RoleKey, string> = {
  farmer: 'border-l-primary',
  buyer: 'border-l-role-buyer',
  seller: 'border-l-accent-harvest',
  fieldOfficer: 'border-l-role-field-officer',
  department: 'border-l-foreground',
  admin: 'border-l-muted-foreground',
}

/** Top accent bar on dashboard sidebar */
export const ROLE_SIDEBAR_BAR: Record<RoleKey, string> = {
  farmer: 'bg-primary',
  buyer: 'bg-role-buyer',
  seller: 'bg-accent-harvest',
  fieldOfficer: 'bg-role-field-officer',
  department: 'bg-foreground/80',
  admin: 'bg-muted-foreground',
}

/** Very light main background tint per role workspace */
export const ROLE_MAIN_BG: Record<RoleKey, string> = {
  farmer: 'bg-primary/[0.02]',
  buyer: 'bg-role-buyer/[0.03]',
  seller: 'bg-accent-harvest/[0.04]',
  fieldOfficer: 'bg-role-field-officer/[0.03]',
  department: 'bg-muted/20',
  admin: 'bg-muted/15',
}

export const ROLE_NAV_ACTIVE: Record<RoleKey, string> = {
  farmer: 'bg-primary/12 font-medium text-primary',
  buyer: 'bg-role-buyer/10 font-medium text-role-buyer',
  seller: 'bg-accent-harvest/15 font-medium text-role-seller',
  fieldOfficer: 'bg-role-field-officer/10 font-medium text-role-field-officer',
  department: 'bg-foreground/8 font-medium text-foreground',
  admin: 'bg-muted font-medium text-foreground',
}
