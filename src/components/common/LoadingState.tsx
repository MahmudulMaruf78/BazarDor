import { Loader2 } from 'lucide-react'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { cn } from 'cn'

type LoadingStateProps = {
  label?: string
  className?: string
}

export function LoadingState({ label, className }: LoadingStateProps) {
  const { t } = useI18n()
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground', className)}
      role="status"
    >
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
      <p className="text-sm">{label ?? t('loading')}</p>
    </div>
  )
}
