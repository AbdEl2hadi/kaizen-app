import { cn } from '#/lib/utils'

type ProgressBarProps = {
  pct?: number
  className?: string
  ariaLabel?: string
}

const barColor = (pct: number) =>
  pct >= 70 ? 'bg-kaizen-primary' : pct >= 30 ? 'bg-amber-500' : 'bg-destructive'

export function ProgressBar({ pct = 0, className, ariaLabel }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={cn('h-[7px] w-full overflow-hidden rounded-full bg-muted', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-200 ease-out', barColor(clamped))}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
