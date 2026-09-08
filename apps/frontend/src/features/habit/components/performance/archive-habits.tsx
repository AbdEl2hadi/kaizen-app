import { Archive as ArchiveIcon, RotateCcw } from 'lucide-react'

import { shortLabel } from '../../lib/date'
import { lifetimeCompletion } from '../../lib/stats'
import { habitActions, useArchivedHabits, useLog } from '../../hooks/use-habit-store'
import { HabitIcon } from '../../lib/icon'
import { ProgressBar } from '../ui/progress-bar'

export function ArchiveHabits() {
  const archivedHabits = useArchivedHabits()
  const log = useLog()

  return (
    <div>
      <h2 className="mb-2.5 flex items-center justify-center gap-2 font-display text-xl font-bold text-muted-foreground">
        <ArchiveIcon className="size-4 text-muted-foreground" aria-hidden />
        Archived Habits
      </h2>
      {archivedHabits.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/60 px-4 py-6 text-center text-sm text-muted-foreground">
          No archived habits. Archive one from Manage Habits.
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {archivedHabits.map((h) => {
            const life = lifetimeCompletion(log, h)
            return (
              <div
                key={h.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm"
              >
                <span
                  aria-hidden
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground"
                >
                  <HabitIcon name={h.icon} className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{h.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Archived {shortLabel(h.archivedAt)} · lifetime {life}%
                  </p>
                  <ProgressBar
                    pct={life}
                    className="mt-1 h-1"
                    ariaLabel={`Lifetime completion of ${h.name}`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => habitActions.restoreHabit(h.id)}
                  className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-kaizen-primary/50 hover:text-kaizen-primary-dark dark:hover:text-kaizen-primary-light"
                >
                  <RotateCcw className="size-3" aria-hidden />
                  Restore
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
