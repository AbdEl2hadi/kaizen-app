import { Settings2 } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip'

import { habitActions, useHabitRange, useHabitView } from '../../hooks/use-habit-store'
import { useHabitLogs } from '../../hooks/use-habit-data'
import { TodaySummary } from './today-summary'
import { LogTable } from './log-table'
import { LogChart } from './log-chart'
import { ManagePanel } from './manage-panel'
import { SegmentedToggle } from '../ui/segmented-toggle'

function LogSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
    </div>
  )
}

function LogError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card px-4 py-10 shadow-sm">
      <p className="text-sm text-muted-foreground">Couldn't load your habits.</p>
      <Button onClick={onRetry} variant="outline" size="sm">
        Retry
      </Button>
    </div>
  )
}

export function DailyLogPage() {
  const view = useHabitView()
  const range = useHabitRange()
  const logs = useHabitLogs()

  if (logs.isPending) return <LogSkeleton />
  if (logs.isError && !logs.data) return <LogError onRetry={() => logs.refetch()} />

  return (
    <section className="flex flex-col gap-4" aria-label="Daily log">
      <TodaySummary />

      <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-between">
        <SegmentedToggle
          ariaLabel="View mode"
          value={view}
          onChange={habitActions.setView}
          options={[
            { value: 'table', label: 'Table' },
            { value: 'chart', label: 'Chart' },
          ]}
        />
        <div className="flex items-center gap-2">
          <SegmentedToggle
            ariaLabel="Date range"
            value={String(range) as '7' | '30'}
            onChange={(r) => habitActions.setRange(Number(r))}
            options={[
              { value: '7', label: 'Week' },
              { value: '30', label: 'Month' },
            ]}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => habitActions.setManageOpen(true)}
                aria-label="Manage habits"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors duration-200 hover:border-kaizen-primary/50 hover:text-kaizen-primary-dark dark:hover:text-kaizen-primary-light"
              >
                <Settings2 className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Manage habits</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {view === 'table' ? <LogTable /> : <LogChart />}
      <ManagePanel />
    </section>
  )
}