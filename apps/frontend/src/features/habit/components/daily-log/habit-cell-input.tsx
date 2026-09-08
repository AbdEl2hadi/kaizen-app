import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Check, Paperclip, X } from 'lucide-react'

import { Checkbox } from '#/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Input } from '#/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { cn } from '#/lib/utils'

import { todayKey } from '../../lib/date'
import { applyValue, habitLogsQueryOptions } from '../../server/habits.server'
import type { HabitLogData } from '../../server/habits.server'
import { useSetLog } from '../../hooks/use-habit-data'
import type { SetLogVars } from '../../hooks/use-habit-data'
import { useHabitRange } from '../../hooks/use-habit-store'
import type { Habit, HabitValue } from '../../types'

const valueClass =
  'h-7 w-full min-w-14 rounded-md border border-input bg-transparent px-1 py-1 text-[11px] text-foreground transition-colors duration-150 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-kaizen-primary'

const DEBOUNCE_MS = 400

function toStr(value: HabitValue | undefined) {
  return typeof value === 'string' ? value : ''
}

function toArr(value: HabitValue | undefined) {
  return Array.isArray(value) ? value : []
}

const DIAL_R = 15
const DIAL_C = 2 * Math.PI * DIAL_R

function dialColor(pct: number) {
  if (pct < 40) return '#ef4444'
  if (pct < 70) return '#f59e0b'
  return 'var(--kaizen-primary)'
}

const PERCENT_STEPS = Array.from({ length: 21 }, (_, i) => i * 5)

function PercentDial({
  value,
  onChange,
  label,
}: {
  value: number
  onChange: (next: number) => void
  label: string
}) {
  const pct = Math.max(0, Math.min(100, value))
  const color = dialColor(pct)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${label}, ${pct}%`}
          className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-kaizen-primary"
        >
          <svg viewBox="0 0 40 40" className="size-9">
            <circle
              cx={20}
              cy={20}
              r={DIAL_R}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth={3.5}
            />
            <circle
              cx={20}
              cy={20}
              r={DIAL_R}
              fill="none"
              stroke={color}
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeDasharray={DIAL_C}
              strokeDashoffset={DIAL_C * (1 - pct / 100)}
              transform="rotate(-90 20 20)"
              className="transition-[stroke-dashoffset,stroke] duration-200"
            />
            <text
              x={20}
              y={20}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground"
              fontSize={8.5}
              fontWeight={700}
            >
              {pct}
            </text>
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        sideOffset={4}
        className="max-h-64 w-28 overflow-y-auto p-1"
      >
        {PERCENT_STEPS.map((step) => (
          <DropdownMenuItem
            key={step}
            onSelect={() => onChange(step)}
            className="flex items-center justify-between text-xs"
          >
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{ backgroundColor: dialColor(step) }}
              />
              {step}%
            </span>
            {step === pct && <Check className="size-3.5" aria-hidden />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Text-like cells (text/number/url/date/files): the cache updates on every
 * keystroke so the grid feels instant, but the network request is debounced
 * and flushed on blur/unmount.
 */
function DebouncedLogInput({
  habit,
  date,
  value,
  mutate,
}: {
  habit: Habit
  date: string
  value: HabitValue | undefined
  mutate: (vars: SetLogVars) => void
}) {
  const queryClient = useQueryClient()
  const range = useHabitRange()
  const currentKey = habitLogsQueryOptions(range, todayKey()).queryKey

  const [draft, setDraft] = useState<HabitValue | undefined>(value)
  const baselineRef = useRef<{ has: boolean; value: HabitValue | undefined }>({
    has: false,
    value: undefined,
  })
  const lastWrittenRef = useRef<HabitValue | undefined>(undefined)
  const latestRef = useRef<HabitValue | undefined>(value)
  const pendingRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const mountedRef = useRef(true)

  const send = (next: HabitValue) => {
    pendingRef.current = false
    mutate({
      habitId: habit.id,
      date,
      value: next,
      prevValue: { value: baselineRef.current.value },
    })
  }

  const handleChange = (next: HabitValue) => {
    if (!baselineRef.current.has) baselineRef.current = { has: true, value }
    lastWrittenRef.current = next
    latestRef.current = next
    pendingRef.current = true
    setDraft(next)
    queryClient.setQueryData<HabitLogData>(currentKey, (old) =>
      applyValue(old, habit.id, date, next)
    )
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      timerRef.current = undefined
      if (!mountedRef.current || !pendingRef.current) return
      const latest = latestRef.current
      if (latest !== undefined) send(latest)
    }, DEBOUNCE_MS)
  }

  const handleBlur = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = undefined
    if (pendingRef.current && latestRef.current !== undefined) send(latestRef.current)
  }

  // Sync when the value changes externally (refetch / rollback). A pending
  // debounced edit keeps its draft — the flush will persist it shortly.
  useEffect(() => {
    if (lastWrittenRef.current === value) return
    if (pendingRef.current) return
    lastWrittenRef.current = undefined
    setDraft(value)
    baselineRef.current = { has: false, value: undefined }
  }, [value])

  // Flush pending edits on unmount without touching state after teardown.
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = undefined
      if (pendingRef.current && latestRef.current !== undefined) {
        mutate({
          habitId: habit.id,
          date,
          value: latestRef.current,
          prevValue: { value: baselineRef.current.value },
        })
      }
    }
  }, [date, habit.id, mutate])

  switch (habit.input.type) {
    case 'number': {
      const target = habit.input.target
      return (
        <div className="flex justify-center items-center gap-1">
          <Input
            type="number"
            value={toStr(draft)}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="0"
            aria-label={habit.name}
            className={cn(valueClass, 'tabular-nums', 'max-w-16 ')}
          />
          {target != null && (
            <span className="text-[10px] w-5 tabular-nums text-muted-foreground">
              /{target}
            </span>
          )}
        </div>
      )
    }

    case 'url':
      return (
        <Input
          type="url"
          value={toStr(draft)}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder="https://…"
          aria-label={habit.name}
          className={cn(valueClass, 'max-w-32')}
        />
      )

    case 'date':
      return (
        <Input
          type="date"
          value={toStr(draft)}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          aria-label={habit.name}
          className={cn(valueClass, 'max-w-31')}
        />
      )

    case 'files': {
      const names = toArr(draft)
      return (
        <div className="flex items-center gap-1">
          <label className="flex h-7 cursor-pointer items-center gap-1 rounded-md border border-input px-1.5 text-[11px] text-muted-foreground transition-colors duration-150 hover:border-ring hover:text-foreground">
            <Paperclip className="size-3" aria-hidden />
            <span className="tabular-nums">{names.length}</span>
            <input
              type="file"
              multiple
              aria-label={habit.name}
              className="sr-only"
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []).map((f) => f.name)
                if (picked.length > 0) handleChange(picked)
                e.target.value = ''
              }}
            />
          </label>
          {names.length > 0 && (
            <button
              type="button"
              onClick={() => handleChange([])}
              aria-label={`Clear files for ${habit.name}`}
              className="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-destructive"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      )
    }

    default:
      return (
        <Input
          type="text"
          value={toStr(draft)}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder="…"
          aria-label={habit.name}
          className={cn(valueClass, 'max-w-32')}
        />
      )
  }
}

export function HabitCellInput({
  habit,
  date,
  value,
  checked,
}: {
  habit: Habit
  date: string
  value: HabitValue | undefined
  checked: boolean
}) {
  const { mutate } = useSetLog()
  const options = habit.input.options ?? []

  switch (habit.input.type) {
    case 'checkbox':
      return (
        <Checkbox
          checked={checked}
          onCheckedChange={(next) =>
            mutate({ habitId: habit.id, date, value: next === true ? 'true' : 'false' })
          }
          aria-label={habit.name}
        />
      )

    case 'text':
    case 'number':
    case 'url':
    case 'date':
    case 'files':
      return <DebouncedLogInput habit={habit} date={date} value={value} mutate={mutate} />

    case 'percent':
      return (
        <PercentDial
          value={Number(toStr(value) || 0)}
          onChange={(next) => mutate({ habitId: habit.id, date, value: String(next) })}
          label={habit.name}
        />
      )

    case 'select':
      return (
        <Select
          value={toStr(value) || undefined}
          onValueChange={(next) => mutate({ habitId: habit.id, date, value: next })}
        >
          <SelectTrigger
            size="sm"
            aria-label={habit.name}
            className="h-7 w-24 justify-between text-[11px]"
          >
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case 'multiselect': {
      const selected = toArr(value)
      return (
        <div className="flex w-full justify-center">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={habit.name}
                className={cn(
                  'h-7 w-12 cursor-pointer rounded-md border border-input bg-transparent text-[11px] tabular-nums transition-colors duration-150 hover:border-ring',
                  selected.length > 0
                    ? 'text-kaizen-primary-dark dark:text-kaizen-primary-light'
                    : 'text-muted-foreground'
                )}
              >
                {selected.length}/{options.length}
              </button>
            </PopoverTrigger>
            <PopoverContent align="center" sideOffset={4} className="w-48 p-2">
              <ul className="space-y-1">
                {options.map((opt) => {
                  const on = selected.includes(opt)
                  return (
                    <li key={opt}>
                      <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-secondary">
                        <Checkbox
                          checked={on}
                          onCheckedChange={() =>
                            mutate({
                              habitId: habit.id,
                              date,
                              value: on ? selected.filter((s) => s !== opt) : [...selected, opt],
                            })
                          }
                        />
                        <span className="truncate">{opt}</span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </PopoverContent>
          </Popover>
        </div>
      )
    }
  }
}