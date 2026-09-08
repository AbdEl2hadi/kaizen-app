import { useCallback, useMemo, useRef } from 'react'
import { useTable } from '@tanstack/react-table'

import { buildLogColumns, logTableFeatures } from '../lib/columns'
import type { LogRow } from '../lib/columns'
import { logDays, todayKey } from '../lib/date'
import { dayPct, statusFor } from '../lib/stats'
import { useHabits, useLog } from './use-habit-data'
import { useHabitRange } from './use-habit-store'

export function useLogTable() {
  const habits = useHabits()
  const log = useLog()
  const range = useHabitRange()
  const todayRowRef = useRef<HTMLTableRowElement>(null)

  const today = todayKey()
  const dates = useMemo(() => logDays(range, today), [range, today])
  const habitById = useMemo(() => new Map(habits.map((h) => [h.id, h])), [habits])
  const rows = useMemo<LogRow[]>(
    () =>
      dates.map((date) => {
        const entry = log[date]
        const pct = dayPct(log, habits, date)
        return {
          date,
          pct,
          isToday: date === today,
          status: statusFor(pct, habits.length),
          checked: new Set(
            Object.entries(entry?.checked ?? {})
              .filter(([, v]) => v)
              .map(([id]) => id)
          ),
          values: entry?.values ?? {},
        }
      }),
    [dates, log, habits, today]
  )
  const columns = useMemo(() => buildLogColumns(habits), [habits])
  const table = useTable({ features: logTableFeatures, data: rows, columns })

  const columnType = useCallback(
    (id: string) => {
      const habit = id.startsWith('habit-') ? habitById.get(id.slice(6)) : undefined
      return habit?.input.type
    },
    [habitById]
  )

  const scrollToToday = useCallback(() => {
    todayRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  return { table, columnType, todayRowRef, scrollToToday }
}
