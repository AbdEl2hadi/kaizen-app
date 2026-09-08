import { useGoals } from '../../hooks/use-habit-store'
import { AddGoalForm } from './add-goal-form'
import { GoalRow } from './goal-row'

export function ToDosPanel() {
  const goals = useGoals()
  const open = goals.filter((g) => !g.done)
  const doneCount = goals.length - open.length

  return (
    <section
      className="mx-auto flex w-full max-w-xl flex-col gap-4"
      aria-label="To-dos"
    >
      <AddGoalForm />

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <h2 className="border-b border-border/60 px-3.5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Open
          <span className="ml-1.5 tabular-nums">({open.length})</span>
        </h2>
        {open.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            All caught up — add a new to-do above.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {open.map((g) => (
              <GoalRow key={g.id} goal={g} />
            ))}
          </ul>
        )}
      </div>

      {doneCount > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-card/60 shadow-sm">
          <h2 className="border-b border-border/60 px-3.5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Done
            <span className="ml-1.5 tabular-nums">({doneCount})</span>
          </h2>
          <ul className="divide-y divide-border/60">
            {goals
              .filter((g) => g.done)
              .map((g) => (
                <GoalRow key={g.id} goal={g} />
              ))}
          </ul>
        </div>
      )}
    </section>
  )
}
