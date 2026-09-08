import { useMemo } from 'react'

import type { ChartDatum } from '../lib/chart-definitions'
import { buildChartDefinition } from '../lib/chart-definitions'
import { useChartColors } from '../lib/chart-theme'
import { logDays, shortLabel, todayKey } from '../lib/date'
import { dayPct } from '../lib/stats'
import type { ChartType } from '../types'
import { useHabits, useLog } from './use-habit-data'
import { useChartType, useHabitRange } from './use-habit-store'

function ariaLabelFor(range: number, chartType: ChartType) {
  const period = range === 7 ? 'this week' : 'this month'
  const labels = {
    line: `Line chart of daily habit completion over ${period}`,
    area: `Area chart of daily habit completion over ${period}`,
    bar: `Bar chart of daily habit completion over ${period}`,
    'stacked-bar': `Stacked bar chart of habit completion per day over ${period}`,
    heatmap: `Calendar heatmap of daily habit completion over ${period}`,
    radial: `Radial progress gauge of average habit completion over ${period}`,
    donut: `Donut chart of daily completion levels over ${period}`,
    radar: `Radar chart of per-habit completion over ${period}`,
  }
  return labels[chartType]
}

export function useLogChart() {
  const habits = useHabits()
  const log = useLog()
  const range = useHabitRange()
  const chartType = useChartType()
  const hex = useChartColors()

  const dates = useMemo(() => logDays(range, todayKey()), [range])
  const daily = useMemo<ChartDatum[]>(
    () =>
      dates.map((key) => ({
        key,
        value: dayPct(log, habits, key),
        full: shortLabel(key),
      })),
    [dates, log, habits]
  )

  const avg = daily.length
    ? Math.round(daily.reduce((s, d) => s + d.value, 0) / daily.length)
    : 0
  const best = useMemo(
    () => daily.reduce((a, b) => (b.value > a.value ? b : a), daily[0]),
    [daily]
  )

  const definition = useMemo(
    () => buildChartDefinition({ chartType, daily, avg, habits, dates, log, hex }),
    [chartType, daily, avg, habits, dates, log, hex]
  )

  const ariaLabel = ariaLabelFor(range, chartType)

  return { avg, best, definition, ariaLabel }
}
