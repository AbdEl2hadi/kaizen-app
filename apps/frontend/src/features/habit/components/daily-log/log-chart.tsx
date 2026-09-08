import { motion } from '@tanstack/charts/motion'
import { Chart } from '@tanstack/react-charts/core'
import {
  CalendarDays,
  ChartArea,
  ChartBar,
  ChartLine,
  ChartPie,
  Gauge,
  Layers,
  Radar,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

import {
  habitActions,
  useChartType,
} from '../../hooks/use-habit-store'
import { useLogChart } from '../../hooks/use-log-chart'
import type { ChartType } from '../../types'

const CHART_OPTIONS: readonly {
  value: ChartType
  label: string
  icon: LucideIcon
}[] = [
  { value: 'line', label: 'Line', icon: ChartLine },
  { value: 'area', label: 'Area', icon: ChartArea },
  { value: 'bar', label: 'Bar', icon: ChartBar },
  { value: 'stacked-bar', label: 'Stacked bar', icon: Layers },
  { value: 'heatmap', label: 'Calendar heatmap', icon: CalendarDays },
  { value: 'radial', label: 'Radial progress', icon: Gauge },
  { value: 'donut', label: 'Donut', icon: ChartPie },
  { value: 'radar', label: 'Radar', icon: Radar },
]

const chartRenderer = motion({
  transition: { type: 'spring', stiffness: 170, damping: 18 },
})

export function LogChart() {
  const chartType = useChartType()
  const { avg, best, definition, ariaLabel } = useLogChart()

  const selected = CHART_OPTIONS.find((o) => o.value === chartType) ?? CHART_OPTIONS[0]
  const SelectedIcon = selected.icon

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-center gap-3 text-center sm:justify-between">
        <div className="flex flex-wrap items-baseline justify-center gap-2">
          <h3 className="font-display text-xl font-bold text-foreground">
            Daily completion
          </h3>
          <p className="text-xs text-muted-foreground">
            Avg{' '}
            <span className="font-semibold tabular-nums text-kaizen-primary-dark dark:text-kaizen-primary-light">
              {avg}%
            </span>
            <span className="mx-2 text-muted-foreground">·</span>
            Best{' '}
            <span className="font-semibold tabular-nums text-foreground">
              {best.value}%
            </span>
          </p>
        </div>

        <Select
          value={chartType}
          onValueChange={(value) => habitActions.setChartType(value as ChartType)}
        >
          <SelectTrigger
            aria-label="Chart type"
            className="h-8 gap-1.5 rounded-md border-border bg-card px-2.5 text-xs font-medium"
          >
            <SelectedIcon className="size-3.5 text-kaizen-primary-dark dark:text-kaizen-primary-light" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHART_OPTIONS.map(({ value, label, icon: Icon }) => (
              <SelectItem key={value} value={value}>
                <Icon className="size-4" />
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Chart
        definition={definition}
        renderer={chartRenderer}
        height={300}
        ariaLabel={ariaLabel}
      />
    </div>
  )
}
