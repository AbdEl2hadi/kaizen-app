import { Locate } from 'lucide-react'

import { cn } from '#/lib/utils'

import { useLogTable } from '../../hooks/use-log-table'
import type { HabitInputType } from '../../types'

const habitClass = (type: HabitInputType): { th: string; td: string } => {
  switch (type) {
    case 'checkbox':
      return { th: 'min-w-14 px-2 py-2 text-center align-bottom', td: 'px-1 py-2 text-center' }
    case 'percent':
    case 'multiselect':
      return { th: 'min-w-16 px-2 py-2 text-center align-bottom', td: 'px-1 py-2 text-center' }
    case 'files':
      return { th: 'min-w-20 px-2 py-2 text-center align-bottom', td: 'px-1 py-2 text-center' }
    case 'number':
      return { th: 'min-w-16 px-2 py-2 text-left align-bottom', td: 'min-w-16 px-2 py-2 text-left' }
    case 'select':
      return { th: 'min-w-28 px-2 py-2 text-left align-bottom', td: 'min-w-28 px-2 py-2 text-left' }
    default:
      return { th: 'min-w-36 px-2 py-2 text-left align-bottom', td: 'min-w-36 px-2 py-2 text-left' }
  }
}

const headerClass = (id: string, type?: HabitInputType) => {
  const base =
    'bg-card px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'
  if (id === 'date') return cn('min-w-[170px] text-left', base)
  if (id === 'progress') return cn('min-w-[170px] text-left', base)
  if (id.startsWith('habit-')) return type ? habitClass(type).th : 'min-w-14 px-2 py-2 text-center align-bottom'
  if (id === 'status') return cn('min-w-[130px] text-left', base)
  return cn('min-w-[80px] text-right', base)
}

const cellClass = (id: string, type?: HabitInputType) => {
  if (id === 'date') return 'min-w-[170px] px-3 py-2 whitespace-nowrap'
  if (id === 'progress') return 'min-w-[170px] px-3 py-2'
  if (id.startsWith('habit-')) return type ? habitClass(type).td : 'px-1 py-2 text-center'
  if (id === 'status') return 'min-w-[130px] px-3 py-2 whitespace-nowrap'
  return 'min-w-[80px] px-3 py-2 text-right'
}

const footerClass = (id: string) => {
  if (id === 'date') return 'px-3 py-1.5 font-semibold uppercase tracking-wide text-muted-foreground'
  if (id.startsWith('habit-')) return 'px-1 py-1.5 text-center tabular-nums text-muted-foreground'
  if (id === 'pct')
    return 'px-3 py-1.5 text-right font-semibold tabular-nums text-kaizen-primary-dark dark:text-kaizen-primary-light'
  return 'px-3 py-1.5 text-muted-foreground'
}

export function LogTable() {
  const { table, columnType, todayRowRef, scrollToToday } = useLogTable()

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id} scope="col" className={headerClass(header.id, columnType(header.id))}>
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              ref={row.original.isToday ? todayRowRef : undefined}
              className={cn(
                'group border-b border-border/60 transition-colors duration-150',
                row.original.isToday
                  ? 'bg-kaizen-mint/70 hover:bg-kaizen-mint'
                  : 'hover:bg-secondary/60'
              )}
            >
              {row.getAllCells().map((cell) => (
                <td key={cell.id} className={cellClass(cell.column.id, columnType(cell.column.id))}>
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {table.getFooterGroups().map((group) => (
            <tr key={group.id} className="border-b border-border bg-secondary/70 text-xs">
              {group.headers.map((footer) =>
                footer.column.id === 'progress' ? null : (
                  <td
                    key={footer.id}
                    colSpan={footer.column.id === 'date' ? 2 : undefined}
                    className={footerClass(footer.column.id)}
                  >
                    <table.FlexRender footer={footer} />
                  </td>
                )
              )}
            </tr>
          ))}
          <tr className="text-muted-foreground transition-colors duration-150 hover:bg-secondary/60">
            <td colSpan={table.getAllLeafColumns().length} className="px-3 py-1.5">
              <button
                type="button"
                onClick={scrollToToday}
                className="flex cursor-pointer items-center gap-1.5 text-sm transition-colors duration-150 hover:text-kaizen-primary-dark dark:hover:text-kaizen-primary-light"
              >
                <Locate size={14} aria-hidden className="text-muted-foreground" />
                Jump to today
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
