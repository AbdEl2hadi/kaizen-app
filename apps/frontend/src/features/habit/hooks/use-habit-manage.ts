import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  archiveHabitFn,
  createHabitFn,
  habitListQueryOptions,
  restoreHabitFn,
  updateHabitFn,
} from '../server/habits.server'
import type { createHabitSchema, updateHabitSchema } from '../schema/habit'
import type { z } from 'zod'

type CreateHabitPayload = z.infer<typeof createHabitSchema>
type UpdateHabitPayload = z.infer<typeof updateHabitSchema>

export function useActiveHabits() {
  return useQuery(habitListQueryOptions(false))
}

export function useArchivedHabits() {
  return useQuery(habitListQueryOptions(true))
}

function invalidateHabits(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: ['habit'] })
}

export function useCreateHabit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateHabitPayload) => createHabitFn({ data: payload }),
    onSuccess: async (res) => {
      if (!res.success) {
        toast.error(res.message ?? "Couldn't create the habit")
        return
      }
      await invalidateHabits(queryClient)
    },
  })
}

export function useUpdateHabit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateHabitPayload) => updateHabitFn({ data: payload }),
    onSuccess: async (res) => {
      if (!res.success) {
        toast.error(res.message ?? "Couldn't save changes")
        return
      }
      await invalidateHabits(queryClient)
    },
  })
}

export function useArchiveHabit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { habitId: string }) => archiveHabitFn({ data: payload }),
    onSuccess: async (res) => {
      if (!res.success) {
        toast.error(res.message ?? "Couldn't archive the habit")
        return
      }
      await invalidateHabits(queryClient)
    },
  })
}

export function useRestoreHabit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { habitId: string }) => restoreHabitFn({ data: payload }),
    onSuccess: async (res) => {
      if (!res.success) {
        toast.error(res.message ?? "Couldn't restore the habit")
        return
      }
      await invalidateHabits(queryClient)
    },
  })
}