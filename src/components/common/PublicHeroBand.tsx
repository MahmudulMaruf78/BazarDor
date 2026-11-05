import type { ReactNode } from 'react'
import { cn } from 'cn'

type PublicHeroBandProps = {
  title: string
  subtitle?: string
  children?: ReactNode
  aside?: ReactNode
  className?: string
}

export function PublicHeroBand({ title, subtitle, children, aside, className }: PublicHeroBandProps) {
  return (
    <section
      className={cn(
        'relative border-b border-primary/20 bg-gradient-to-br from-primary/18 via-secondary/90 to-background',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.58_0.12_155/0.22),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-2/5 max-w-md bg-gradient-to-l from-leaf/10 to-transparent"
        aria-hidden
      />
      <div
        className={cn(
          'relative mx-auto max-w-6xl px-4 py-10 md:py-12',
          aside ? 'grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,380px)] md:items-center' : 'space-y-4',
        )}
      >
        <div className="space-y-4">
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-primary md:text-4xl">{title}</h1>
          {subtitle ? <p className="max-w-2xl text-base text-muted-foreground md:text-lg">{subtitle}</p> : null}
          {children ? <div className="flex flex-wrap gap-2 pt-1">{children}</div> : null}
        </div>
        {aside ? <div className="min-w-0">{aside}</div> : null}
      </div>
    </section>
  )
}
