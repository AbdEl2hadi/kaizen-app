import { ChevronDown } from 'lucide-react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '#/components/ui/collapsible'
import { cn } from '#/lib/utils'

import { addDays, todayKey } from '../../lib/date'
import { goalBuckets } from '../../lib/stats'
import { useGoals } from '../../hooks/use-habit-store'
import { AddGoalForm } from './add-goal-form'
import { GoalRow } from './goal-row'

const SECTIONS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'later', label: 'Later' },
  { key: 'done', label: 'Done' },
] as const

export function GoalsPanel() {
  const goals = useGoals()
  const buckets = goalBuckets(goals)

  const inWeek = (g: (typeof goals)[number]) => !(g.due && g.due > addDays(todayKey(), 6))
  const weekTotal = goals.filter(inWeek).length
  const weekDone = goals.filter((g) => g.done && inWeek(g)).length
  const weekPct = weekTotal ? Math.round((weekDone / weekTotal) * 100) : 0

  return (
    <section
      className="mx-auto flex w-full max-w-xl flex-col gap-4"
      aria-label="Goals and to-dos"
    >
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex items-baseline justify-between">
          <p className="text-xl text-foreground">
            <span className="font-semibold tabular-nums text-kaizen-primary-dark dark:text-kaizen-primary-light">
              {weekDone}
            </span>
            <span className="text-muted-foreground"> of </span>
            <span className="font-semibold tabular-nums">{weekTotal}</span>
            <span className="text-muted-foreground"> goals completed this week</span>
          </p>
          <span className="text-xs font-semibold tabular-nums text-muted-foreground">
            {weekPct}%
          </span>
        </div>
        <div
          className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={weekPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Weekly goal completion"
        >
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-200 ease-out',
              weekPct >= 100 ? 'bg-kaizen-primary' : 'bg-kaizen-primary-dark dark:bg-kaizen-primary-light'
            )}
            style={{ width: `${weekPct}%` }}
          />
        </div>
      </div>

      <AddGoalForm />

      <div className="flex flex-col gap-2">
        {SECTIONS.map((sec) => {
          const isDone = sec.key === 'done'
          const items = buckets[sec.key]
          return (
            <Collapsible
              key={sec.key}
              asChild
              className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <section>
                <h3 className="flex items-center justify-between px-3.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <CollapsibleTrigger className="flex cursor-pointer items-center gap-1.5 transition-colors duration-200 hover:text-kaizen-primary-dark dark:hover:text-kaizen-primary-light">
                    <ChevronDown
                      className="size-3.5 transition-transform duration-200 data-[state=closed]:-rotate-90"
                      aria-hidden
                    />
                    {sec.label}
                    <span className="tabular-nums text-muted-foreground">({items.length})</span>
                  </CollapsibleTrigger>
                </h3>
                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
                  <ul className={cn('border-t border-border/60', isDone && 'bg-muted/30')}>
                    {items.length === 0 && (
                      <li className="px-4 py-2.5 text-sm text-muted-foreground">Nothing here.</li>
                    )}
                    {items.map((g) => (
                      <GoalRow key={g.id} goal={g} />
                    ))}
                  </ul>
                </CollapsibleContent>
              </section>
            </Collapsible>
          )
        })}
      </div>
    </section>
  )
}
