import { useCallback, useState } from 'react'

import { addDays, todayKey } from '../lib/date'
import { addGoalSchema } from '../schema/habit'
import type { Priority } from '../types'
import { habitActions } from './use-habit-store'

export type GoalDue = 'today' | 'week' | 'none'

export function useAddGoalForm() {
  const [title, setTitle] = useState('')
  const [due, setDue] = useState<GoalDue>('today')
  const [priority, setPriority] = useState<Priority>('med')

  const add = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const parsed = addGoalSchema.safeParse({ title, due, priority })
      if (!parsed.success) return
      const dueKey =
        parsed.data.due === 'today'
          ? todayKey()
          : parsed.data.due === 'week'
            ? addDays(todayKey(), 3)
            : ''
      habitActions.addGoal(parsed.data.title, dueKey, parsed.data.priority)
      setTitle('')
    },
    [due, priority, title]
  )

  return { title, setTitle, due, setDue, priority, setPriority, add }
}
