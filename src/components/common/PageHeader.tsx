import type { ReactNode } from 'react'
import type { RoleKey } from '@/constants/roles'
import { ROLE_PAGE_ACCENT } from '@/constants/roleVisual'
import { cn } from 'cn'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  role?: RoleKey
  actions?: ReactNode
  className?: string
}

export function PageHeader({ eyebrow, title, subtitle, role, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'border-b border-border pb-4 pl-4',
        role ? cn('border-l-[3px]', ROLE_PAGE_ACCENT[role]) : 'border-l-[3px] border-l-transparent',
        className,
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{eyebrow}</p>
          ) : null}
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground md:text-[1.625rem]">
            {title}
          </h1>
          {subtitle ? <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  )
}
