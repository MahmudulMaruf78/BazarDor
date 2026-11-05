import type { PropsWithChildren } from 'react'
import type { RoleKey } from '@/constants/roles'
import { PageHeader } from '@/components/common/PageHeader'

type RoleWorkspaceShellProps = PropsWithChildren<{
  role: RoleKey
  eyebrow: string
  title: string
  subtitle?: string
}>

export function RoleWorkspaceShell({ role, eyebrow, title, subtitle, children }: RoleWorkspaceShellProps) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} role={role} />
      {children}
    </div>
  )
}
