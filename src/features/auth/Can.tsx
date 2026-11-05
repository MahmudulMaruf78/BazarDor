import type { ReactNode, PropsWithChildren } from 'react'
import type { PermissionKey } from '@/constants/permissions'
import { useAppSelector } from '@/app/store/hooks'
import { selectAuthRole } from '@/features/auth/authSlice'
import { hasPermission } from '@/features/auth/permissions'

type CanProps = PropsWithChildren<{
  permission: PermissionKey
  fallback?: ReactNode
}>

export function Can({ permission, children, fallback = null }: CanProps) {
  const role = useAppSelector(selectAuthRole)
  if (!role || !hasPermission(role, permission)) return fallback
  return children
}
