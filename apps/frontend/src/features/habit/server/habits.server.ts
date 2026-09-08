import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { apiServer } from '#/lib/api/server'
import { sessionMiddleware } from '#/lib/api/session-middleware'

import { logDays, todayKey } from '../lib/date'
import { valueIsDone } from '../lib/inputs'
import {
  createHabitSchema,
  habitIdSchema,
  updateHabitSchema,
} from '../schema/habit'
import type { Habit, HabitInput, HabitInputType, HabitValue, Log } from '../types'

export type HabitLogValue = boolean | number | string | string[]

export type HabitLogDTO = {
  date: string
  value: HabitLogValue
}

export type HabitDTO = {
  id: string
  name: string
  icon: string
  input: {
    type: HabitInputType
    config?: { options?: string[]; target?: number } | null
  }
  sortOrder: number
  isActive: boolean
  logs?: HabitLogDTO[]
}

export type HabitLogData = {
  habits: Habit[]
  log: Log
}

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const getHabitsFn = createServerFn({ method: 'GET' })
  .validator(z.object({ archived: z.boolean() }))
  .middleware([sessionMiddleware])
  .handler(({ data, context }) =>
    apiServer<HabitDTO[]>(
      `/api/habits?archived=${data.archived}`,
      undefined,
      context.session
    )
  )

export const createHabitFn = createServerFn({ method: 'POST' })
  .validator(createHabitSchema)
  .middleware([sessionMiddleware])
  .handler(({ data, context }) =>
    apiServer<HabitDTO>(
      '/api/habits',
      { method: 'POST', body: JSON.stringify(data) },
      context.session
    )
  )

export const updateHabitFn = createServerFn({ method: 'POST' })
  .validator(updateHabitSchema)
  .middleware([sessionMiddleware])
  .handler(({ data, context }) =>
    apiServer<HabitDTO>(
      `/api/habits/${data.habitId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ name: data.name, icon: data.icon }),
      },
      context.session
    )
  )

export const archiveHabitFn = createServerFn({ method: 'POST' })
  .validator(z.object({ habitId: habitIdSchema }))
  .middleware([sessionMiddleware])
  .handler(({ data, context }) =>
    apiServer<null>(`/api/habits/${data.habitId}`, { method: 'DELETE' }, context.session)
  )

export const restoreHabitFn = createServerFn({ method: 'POST' })
  .validator(z.object({ habitId: habitIdSchema }))
  .middleware([sessionMiddleware])
  .handler(({ data, context }) =>
    apiServer<null>(
      `/api/habits/${data.habitId}/restore`,
      { method: 'PATCH' },
      context.session
    )
  )

export const getHabitLogsFn = createServerFn({ method: 'GET' })
  .validator(
    z.object({
      range: z.union([z.literal(7), z.literal(30)]),
      date: dateSchema,
    })
  )
  .middleware([sessionMiddleware])
  .handler(({ data, context }) => {
    const endpoint = data.range === 30 ? 'month' : 'week'
    return apiServer<HabitDTO[]>(
      `/api/habits/logs/${endpoint}?date=${data.date}`,
      undefined,
      context.session
    )
  })

export const setHabitLogFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      habitId: z.string().min(1),
      date: dateSchema,
      value: z.unknown(),
    })
  )
  .middleware([sessionMiddleware])
  .handler(({ data, context }) =>
    apiServer<null>(
      `/api/habits/${data.habitId}/logs/${data.date}`,
      { method: 'PUT', body: JSON.stringify({ value: data.value }) },
      context.session
    )
  )

export function habitLogsQueryOptions(range: number, date: string) {
  return queryOptions({
    queryKey: ['habit', 'logs', range, date],
    queryFn: async () => {
      const res = await getHabitLogsFn({
        data: { range: range === 30 ? 30 : 7, date },
      })
      if (!res.success) throw new Error(res.message ?? 'Failed to load habits')
      return toHabitLog(res.data ?? [], range === 30 ? 30 : 7, date)
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}

export function habitListQueryOptions(archived: boolean) {
  return queryOptions({
    queryKey: ['habit', 'list', archived],
    queryFn: async () => {
      const res = await getHabitsFn({ data: { archived } })
      if (!res.success) throw new Error(res.message ?? 'Failed to load habits')
      return toHabitList(res.data ?? [])
    },
    staleTime: 30_000,
  })
}

/** Server value → frontend `HabitValue` (strings/arrays the UI understands). */
export function serverValueToFrontend(value: unknown, type: HabitInputType): HabitValue {
  if (type === 'number' || type === 'percent') return String(value)
  if (type === 'checkbox') return String(value)
  if (type === 'files') return typeof value === 'string' && value ? value.split(', ') : []
  if (Array.isArray(value)) return value as string[]
  return String(value ?? '')
}

/** Frontend `HabitValue` → server-shaped JSON value (validated by the backend). */
export function toServerValue(value: HabitValue | undefined, type?: HabitInputType): unknown {
  switch (type) {
    case 'checkbox':
      return value === 'true'
    case 'number':
    case 'percent':
      return Number(value ?? 0)
    case 'multiselect':
      return Array.isArray(value) ? value : []
    case 'files':
      return Array.isArray(value) ? value.join(', ') : String(value ?? '')
    default:
      return typeof value === 'string' ? value : ''
  }
}

function windowFor(range: 7 | 30, date: string): [string, string] {
  const days = logDays(range, date)
  return [days[0], days[days.length - 1]]
}

function toInput(dto: HabitDTO): HabitInput {
  return {
    type: dto.input.type,
    options: dto.input.config?.options,
    target: dto.input.config?.target,
  }
}

function toHabit(dto: HabitDTO): Habit {
  return {
    id: dto.id,
    name: dto.name,
    icon: dto.icon,
    createdAt: todayKey(),
    input: toInput(dto),
    sortOrder: dto.sortOrder,
  }
}

/** Normalize a `GET /habits` (active/archived) response into frontend habits. */
export function toHabitList(habits: HabitDTO[]): Habit[] {
  return habits.map(toHabit)
}

/** Normalize a `GET /habits/logs/week|month` response into frontend habits + log. */
export function toHabitLog(habits: HabitDTO[], range: 7 | 30, date: string): HabitLogData {
  const [start, end] = windowFor(range, date)
  const log: Log = {}
  const normalized: Habit[] = habits.map(toHabit)

  for (const dto of habits) {
    const input = toInput(dto)
    for (const entry of dto.logs ?? []) {
      if (entry.date < start || entry.date > end) continue
      const value = serverValueToFrontend(entry.value, dto.input.type)
      const day = log[entry.date] ?? { checked: {}, values: {}, note: '' }
      day.values[dto.id] = value
      day.checked[dto.id] = valueIsDone(input, value)
      log[entry.date] = day
    }
  }
  return { habits: normalized, log }
}

/** Optimistic cell write: update `values` + recompute `checked` for one habit/day. */
export function applyValue(
  old: HabitLogData | undefined,
  habitId: string,
  date: string,
  value: HabitValue | undefined
): HabitLogData | undefined {
  if (!old) return old
  const habit = old.habits.find((h) => h.id === habitId)
  if (!habit) return old
  const entry = old.log[date] ?? { checked: {}, values: {}, note: '' }
  const values = { ...entry.values }
  if (value === undefined) delete values[habitId]
  else values[habitId] = value
  return {
    ...old,
    log: {
      ...old.log,
      [date]: {
        ...entry,
        values,
        checked: { ...entry.checked, [habitId]: valueIsDone(habit.input, value) },
      },
    },
  }
}