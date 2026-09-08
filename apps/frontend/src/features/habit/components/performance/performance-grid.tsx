import { CalendarDays } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip'
import { cn } from '#/lib/utils'

import { MONTH_NAMES } from '../../constants'
import { monthKeys, shortLabel } from '../../lib/date'
import { dayPct } from '../../lib/stats'
import { hexToRgb, useChartColors } from '../../lib/chart-theme'
import { useArchivedHabits, useHabits, useLog } from '../../hooks/use-habit-store'
import { usePerformanceYears } from '../../hooks/use-performance-years'
import type { Habit, Log } from '../../types'

function heatAlpha(pct: number) {
  const a = 0.16 + (pct / 100) * 0.72
  return a.toFixed(2)
}

function MonthCard({
  year,
  month,
  log,
  habits,
}: {
  year: number
  month: number
  log: Log
  habits: readonly Habit[]
}) {
  const hex = useChartColors()
  const keys = monthKeys(year, month)
  const pcts = keys.map((k) => dayPct(log, habits, k))
  const avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0
  const filled = pcts.filter((p) => p > 0).length
  const brandRgb = hexToRgb(hex.full)

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="rounded-t-lg bg-secondary px-3 pb-2 pt-2.5">
        <p className="font-display text-xs font-bold capitalize tracking-tight text-foreground">
          {MONTH_NAMES[month]}
        </p>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {String(month + 1).padStart(2, '0')} | {year}
        </p>
      </div>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="flex flex-1 items-center gap-[3px]" aria-hidden>
          {pcts.map((p, i) => (
            <Tooltip key={keys[i]}>
              <TooltipTrigger asChild>
                <span
                  className="aspect-square flex-1 rounded-[2px]"
                  style={{
                    backgroundColor:
                      p <= 0 ? hex.empty : p >= 100 ? hex.full : `rgba(${brandRgb}, ${heatAlpha(p)})`,
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>
                {shortLabel(keys[i])} · {p}%
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <span className="w-9 shrink-0 text-right text-xs font-bold tabular-nums text-kaizen-primary-dark dark:text-kaizen-primary-light">
          {avg}%
        </span>
      </div>
      <div className="flex items-center justify-between border-t border-border/60 px-3 py-1 text-[10px] text-muted-foreground">
        <span>
          {filled}/{keys.length} days
        </span>
        <span>{filled === 0 ? 'no data' : 'active'}</span>
      </div>
    </div>
  )
}

export function PerformanceGrid() {
  const log = useLog()
  const habits = useHabits()
  const archivedHabits = useArchivedHabits()
  const { years, year, setYear } = usePerformanceYears()
  const allHabits = [...habits, ...archivedHabits]

  return (
    <section className="flex flex-col gap-6" aria-label="Performance">
      <div>
        <div className="mb-3 flex items-center justify-center gap-3">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
            <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
            Monthly Performance
          </h2>
          <div
            role="group"
            aria-label="Choose year"
            className="flex overflow-hidden rounded-md border border-border"
          >
            {years.map((y) => (
              <button
                key={y}
                type="button"
                aria-pressed={year === y}
                onClick={() => setYear(y)}
                className={cn(
                  'cursor-pointer px-3 py-1 text-xs font-semibold tabular-nums transition-colors duration-200',
                  year === y
                    ? 'bg-kaizen-mint text-kaizen-primary-dark dark:text-kaizen-primary-light'
                    : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 12 }, (_, m) => (
            <MonthCard key={m} year={year} month={m} log={log} habits={allHabits} />
          ))}
        </div>
      </div>
    </section>
  )
}
