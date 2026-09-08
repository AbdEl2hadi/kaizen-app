import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { todayKey } from '../lib/date'
import {
  applyValue,
  habitLogsQueryOptions,
  setHabitLogFn,
  toServerValue,
} from '../server/habits.server'
import type { HabitLogData } from '../server/habits.server'
import type { HabitValue } from '../types'
import { useHabitRange } from './use-habit-store'

export function useHabitLogs() {
  const range = useHabitRange()
  return useQuery(habitLogsQueryOptions(range, todayKey()))
}

export function useHabits() {
  const { data } = useHabitLogs()
  return data?.habits ?? []
}

export function useLog() {
  const { data } = useHabitLogs()
  return data?.log ?? {}
}

export type SetLogVars = {
  habitId: string
  date: string
  value: HabitValue
  /** Per-cell rollback target for debounced edits (the pre-edit server value). */
  prevValue?: { value: HabitValue | undefined }
}

function rollback(
  queryClient: ReturnType<typeof useQueryClient>,
  currentKey: readonly unknown[],
  prev: HabitLogData | undefined,
  vars: SetLogVars
) {
  if (vars.prevValue !== undefined) {
    const prevValue = vars.prevValue.value
    queryClient.setQueryData<HabitLogData>(currentKey, (old) =>
      applyValue(old, vars.habitId, vars.date, prevValue)
    )
    return
  }
  queryClient.setQueryData<HabitLogData>(currentKey, prev)
}

export function useSetLog() {
  const queryClient = useQueryClient()
  const range = useHabitRange()
  const currentKey = habitLogsQueryOptions(range, todayKey()).queryKey

  const mutation = useMutation({
    mutationFn: async (vars: SetLogVars) => {
      const data = queryClient.getQueryData<HabitLogData>(currentKey)
      const type = data?.habits.find((h) => h.id === vars.habitId)?.input.type
      return setHabitLogFn({
        data: {
          habitId: vars.habitId,
          date: vars.date,
          value: toServerValue(vars.value, type),
        },
      })
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ['habit', 'logs'] })
      const prev = queryClient.getQueryData<HabitLogData>(currentKey)
      queryClient.setQueryData<HabitLogData>(currentKey, (old) =>
        applyValue(old ?? prev, vars.habitId, vars.date, vars.value)
      )
      return { prev }
    },
    onSuccess: (res, vars, ctx) => {
      if (res.success) return
      rollback(queryClient, currentKey, ctx.prev, vars)
      toast.error(res.message ?? "Couldn't save — tap to retry", {
        action: { label: 'Retry', onClick: () => mutation.mutate(vars) },
      })
    },
    onError: (_err, vars, ctx) => {
      rollback(queryClient, currentKey, ctx?.prev, vars)
      toast.error("Couldn't save — tap to retry", {
        action: { label: 'Retry', onClick: () => mutation.mutate(vars) },
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['habit', 'logs'] })
    },
  })

  return mutation
}