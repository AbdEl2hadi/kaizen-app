import { Plus } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

import { PRIORITY_SELECTED } from '../../constants'
import { useAddGoalForm } from '../../hooks/use-add-goal-form'
import type { GoalDue } from '../../hooks/use-add-goal-form'

const DUE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'none', label: 'No date' },
] as const satisfies readonly { value: GoalDue; label: string }[]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'med', label: 'Med' },
  { value: 'high', label: 'High' },
] as const

export function AddGoalForm() {
  const { title, setTitle, due, setDue, priority, setPriority, add } =
    useAddGoalForm()

  return (
    <form
      onSubmit={add}
      className="rounded-lg border border-border bg-card p-4 shadow-sm"
      aria-label="Add a goal"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
          <Plus className="size-3.5" aria-hidden />
        </span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new goal…"
          aria-label="Goal title"
          maxLength={120}
          className="w-full flex-1 bg-transparent px-1 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2 pl-10">
        <div
          role="group"
          aria-label="Due date"
          className="flex overflow-hidden rounded-md border border-border"
        >
          {DUE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={due === opt.value}
              onClick={() => setDue(opt.value)}
              className={cn(
                'cursor-pointer px-2.5 py-1 text-xs transition-colors duration-200',
                due === opt.value
                  ? 'bg-kaizen-mint font-semibold text-kaizen-primary-dark dark:text-kaizen-primary-light'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div
          role="group"
          aria-label="Priority"
          className="flex overflow-hidden rounded-md border border-border"
        >
          {PRIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={priority === opt.value}
              onClick={() => setPriority(opt.value)}
              className={cn(
                'cursor-pointer px-2.5 py-1 text-xs capitalize transition-colors duration-200',
                priority === opt.value
                  ? PRIORITY_SELECTED[opt.value]
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Button type="submit" disabled={!title.trim()} size="sm" className="ml-auto">
          Add goal
        </Button>
      </div>
    </form>
  )
}
