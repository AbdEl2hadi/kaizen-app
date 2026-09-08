import { Trash2 } from 'lucide-react'

import { Checkbox } from '#/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip'
import { cn } from '#/lib/utils'

import { PRIORITY_LABEL, PRIORITY_STYLES } from '../../constants'
import { habitActions } from '../../hooks/use-habit-store'
import type { Goal } from '../../types'

export function GoalRow({ goal }: { goal: Goal }) {
  return (
    <li className="group flex items-center gap-3 px-3.5 py-2 transition-colors duration-150 hover:bg-secondary/60">
      <Checkbox
        checked={goal.done}
        onCheckedChange={() => habitActions.toggleGoal(goal.id)}
        aria-label={goal.title}
      />
      <span
        className={cn(
          'flex-1 break-words text-sm transition-colors duration-150',
          goal.done ? 'text-muted-foreground line-through' : 'text-foreground'
        )}
      >
        {goal.title}
      </span>
      {goal.due && !goal.done && (
        <span className="hidden text-xs tabular-nums text-muted-foreground sm:inline">
          {goal.due.slice(5).replace('-', '/')}
        </span>
      )}
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-[10px] font-semibold',
          PRIORITY_STYLES[goal.priority]
        )}
      >
        {PRIORITY_LABEL[goal.priority]}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => habitActions.deleteGoal(goal.id)}
            aria-label={`Delete "${goal.title}"`}
            className="cursor-pointer text-muted-foreground opacity-100 transition-opacity duration-150 hover:text-destructive focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
          >
            <Trash2 className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Delete goal</TooltipContent>
      </Tooltip>
    </li>
  )
}
