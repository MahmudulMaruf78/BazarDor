import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from 'cn'

export type MetricTile = {
  label: string
  value: string
  hint?: string
}

type MetricTileGridProps = {
  metrics: MetricTile[]
  className?: string
}

export function MetricTileGrid({ metrics, className }: MetricTileGridProps) {
  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {metrics.map((item) => (
        <Card key={item.label} className="border-border/80 shadow-xs">
          <CardHeader className="gap-1 pb-4 pt-4">
            <CardDescription className="text-xs uppercase tracking-wide">{item.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">{item.value}</CardTitle>
            {item.hint ? <p className="text-xs text-muted-foreground">{item.hint}</p> : null}
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
