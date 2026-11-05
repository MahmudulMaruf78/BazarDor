import type { MessageKey } from '@/lib/i18n/messages'

export function documentTitleKeyForPath(pathname: string): MessageKey {
  if (pathname === '/') return 'docTitleHome'
  if (pathname.startsWith('/explore')) return 'docTitleExplore'
  if (pathname.startsWith('/login')) return 'docTitleLogin'
  if (pathname.startsWith('/farmer')) return 'docTitleFarmer'
  if (pathname.startsWith('/buyer')) return 'docTitleBuyer'
  if (pathname.startsWith('/seller')) return 'docTitleSeller'
  if (pathname.startsWith('/field-officer')) return 'docTitleFieldOfficer'
  if (pathname.startsWith('/department')) return 'docTitleDepartment'
  if (pathname.startsWith('/admin')) return 'docTitleAdmin'
  if (pathname.startsWith('/listing/')) return 'docTitleListing'
  if (pathname.startsWith('/access-denied')) return 'docTitleAccessDenied'
  return 'docTitleNotFound'
}
