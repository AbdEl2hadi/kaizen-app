import { dayChecked, dayPct, statusFor } from '../../lib/stats'
import { todayKey } from '../../lib/date'
import { useHabits, useLog } from '../../hooks/use-habit-data'
import { ProgressBar } from '../ui/progress-bar'

const TONE = {
  ok: 'text-kaizen-primary-dark dark:text-kaizen-primary-light',
  warn: 'text-amber-600 dark:text-amber-400',
  fire: 'text-[#ff6f5e]',
  muted: 'text-muted-foreground',
} as const

export function TodaySummary() {
  const habits = useHabits()
  const log = useLog()
  const today = todayKey()
  const pct = dayPct(log, habits, today)
  const done = dayChecked(log, habits, today).length
  const total = habits.length
  const status = statusFor(pct, total)

  if (total === 0) {
    return (
      <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3.5 shadow-sm">
        <p className="text-sm text-muted-foreground">No habits yet</p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3.5 shadow-sm">
      <div className="min-w-0 shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Today
        </p>
        <p className="font-display text-2xl font-bold leading-tight tracking-tight text-foreground tabular-nums">
          {pct}%
        </p>
      </div>
      <div className="min-w-0 flex-1">
        <ProgressBar pct={pct} ariaLabel="Today's progress" />
        <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">
          <span className="font-semibold text-foreground">{done}</span> of {total} habits
        </p>
      </div>
      <p className={`shrink-0 text-sm font-medium ${TONE[status.tone]}`}>
        <span aria-hidden className="mr-1.5">
          {status.emoji}
        </span>
        {status.label}
      </p>
    </div>
  )
}
