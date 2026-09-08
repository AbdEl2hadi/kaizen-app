import { createColumnHelper, tableFeatures } from '@tanstack/react-table'

import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip'
import { cn } from '#/lib/utils'

import { shortLabel } from './date'
import { HabitIcon } from './icon'
import { HabitCellInput } from '../components/daily-log/habit-cell-input'
import { ProgressBar } from '../components/ui/progress-bar'
import type { Habit, HabitValue, Status } from '../types'

export type LogRow = {
  date: string
  pct: number
  isToday: boolean
  status: Status
  checked: ReadonlySet<string>
  values: Record<string, HabitValue>
}

export const logTableFeatures = tableFeatures({})
const helper = createColumnHelper<typeof logTableFeatures, LogRow>()

const toneClass = (tone: Status['tone']) =>
  ({
    ok: 'text-kaizen-primary-dark dark:text-kaizen-primary-light',
    warn: 'text-amber-600 dark:text-amber-400',
    fire: 'text-[#ff6f5e]',
    muted: 'text-muted-foreground',
  })[tone]

export const buildLogColumns = (habits: readonly Habit[]) =>
  helper.columns([
    helper.display({
      id: 'date',
      header: 'Date',
      footer: 'Average',
      cell: ({ row }) => (
        <>
          <span
            className={cn(
              row.original.isToday
                ? 'font-semibold text-kaizen-primary-dark dark:text-kaizen-primary-light'
                : 'text-foreground'
            )}
          >
            {shortLabel(row.original.date)}
          </span>
          {row.original.isToday && (
            <span className="ml-2 rounded bg-kaizen-mint px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-kaizen-primary-dark dark:text-kaizen-primary-light">
              Today
            </span>
          )}
        </>
      ),
    }),
    helper.display({
      id: 'progress',
      header: 'Progress',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <ProgressBar
            pct={row.original.pct}
            className="max-w-27.5"
            ariaLabel={`Progress on ${shortLabel(row.original.date)}`}
          />
          <span className="w-13 text-right text-xs tabular-nums text-muted-foreground">
            {row.original.pct}%
          </span>
        </div>
      ),
    }),
    ...habits.map((h) =>
      helper.display({
        id: `habit-${h.id}`,
        header: () => (
          <div className="flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <span aria-label={h.name} className="inline-flex">
                  <HabitIcon name={h.icon} className="size-4.5" />
                </span>
              </TooltipTrigger>
              <TooltipContent>{h.name}</TooltipContent>
            </Tooltip>
          </div>
        ),
        footer: ({ table }) => {
          const rows = table.getRowModel().rows
          const done = rows.filter((r) => r.original.checked.has(h.id)).length
          return rows.length ? `${Math.round((done / rows.length) * 100)}%` : '0%'
        },
        cell: ({ row }) => (
          <HabitCellInput
            habit={h}
            date={row.original.date}
            value={row.original.values[h.id]}
            checked={row.original.checked.has(h.id)}
          />
        ),
      })
    ),
    helper.display({
      id: 'status',
      header: 'Daily Status',
      cell: ({ row }) => (
        <span className={cn('flex items-center gap-1.5', toneClass(row.original.status.tone))}>
          <span aria-hidden>{row.original.status.emoji}</span>
          {row.original.status.label}
        </span>
      ),
    }),
    helper.display({
      id: 'pct',
      header: 'Daily %',
      footer: ({ table }) => {
        const rows = table.getRowModel().rows
        if (!rows.length) return '0%'
        const avg = Math.round(rows.reduce((sum, r) => sum + r.original.pct, 0) / rows.length)
        return `${avg}%`
      },
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums text-foreground">{row.original.pct}%</span>
      ),
    }),
  ])
