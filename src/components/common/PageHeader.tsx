import type { RoleKey } from '@/constants/roles'
import { ROLE_PAGE_ACCENT } from '@/constants/roleVisual'
import { cn } from 'cn'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  role?: RoleKey
  className?: string
}

export function PageHeader({ eyebrow, title, subtitle, role, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'border-b border-border pb-4 pl-4',
        role ? cn('border-l-[3px]', ROLE_PAGE_ACCENT[role]) : 'border-l-[3px] border-l-transparent',
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-wide text-bazardor-muted">{eyebrow}</p>
      ) : null}
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-bazardor-navy md:text-[1.625rem]">
        {title}
      </h1>
      {subtitle ? <p className="mt-1 max-w-3xl text-sm text-bazardor-muted">{subtitle}</p> : null}
    </header>
  )
}
