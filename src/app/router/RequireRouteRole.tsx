import { Navigate, useLocation } from 'react-router-dom'
import type { PropsWithChildren } from 'react'
import { useAppSelector } from '@/app/store/hooks'
import { selectAuthRole, selectAuthSession } from '@/features/auth/authSlice'
import { canRoleAccessPath } from '@/features/auth/routeAccess'

export function RequireRouteRole({ children }: PropsWithChildren) {
  const session = useAppSelector(selectAuthSession)
  const role = useAppSelector(selectAuthRole)
  const location = useLocation()

  if (!session || !role) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!canRoleAccessPath(role, location.pathname)) {
    return <Navigate to="/access-denied" replace state={{ from: location.pathname }} />
  }

  return children
}
