import {
  areaY,
  barY,
  cell,
  d3Curve,
  defineChart,
  lineY,
  ruleY,
  stack,
} from '@tanstack/charts'
import {
  angleGrid,
  pie,
  polar,
  radialArc,
  radialArea,
  radialDot,
  radialGrid,
  radialLine,
} from '@tanstack/charts/polar'
import { tooltip } from '@tanstack/charts/tooltip'
import { scaleBand } from '@tanstack/charts-scales/band'
import { scaleLinear } from '@tanstack/charts-scales/linear'
import { scaleOrdinal } from '@tanstack/charts-scales/ordinal'
import { scalePoint } from '@tanstack/charts-scales/point'
import type { ChartDefinition } from '@tanstack/react-charts'
import { curveLinearClosed, curveMonotoneX } from 'd3-shape'

import type { ChartType, Habit, Log } from '../types'
import type { ChartColors } from './chart-theme'

export type ChartDatum = {
  key: string
  value: number
  full: string
}

type Level = 'none' | 'low' | 'mid' | 'high' | 'full'

type LevelDatum = {
  key: string
  week: number
  weekday: number
  level: Level
  full: string
}

type StackDatum = {
  key: string
  habitId: string
  done: number
}

type HabitRow = {
  id: string
  name: string
  pct: number
  normalized: number
}

const LEVELS: readonly Level[] = ['none', 'low', 'mid', 'high', 'full']

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function levelOf(value: number): Level {
  if (value >= 100) return 'full'
  if (value >= 80) return 'high'
  if (value >= 50) return 'mid'
  if (value >= 1) return 'low'
  return 'none'
}

function xTick(value: unknown) {
  return String(value).slice(5).replace('-', '/')
}

export function buildChartDefinition({
  chartType,
  daily,
  avg,
  habits,
  dates,
  log,
  hex,
}: {
  chartType: ChartType
  daily: ChartDatum[]
  avg: number
  habits: readonly Habit[]
  dates: readonly string[]
  log: Log
  hex: ChartColors
}): ChartDefinition {
  const habitRows: HabitRow[] = habits.map((h) => {
    const done = dates.filter((key) => log[key]?.checked[h.id]).length
    const pct = dates.length ? Math.round((done / dates.length) * 100) : 0
    return { id: h.id, name: h.name, pct, normalized: pct / 100 }
  })

  const stackData: StackDatum[] = dates.flatMap((key) =>
    habits.map((h) => ({
      key,
      habitId: h.id,
      done: log[key]?.checked[h.id] ? 1 : 0,
    }))
  )

  const start = new Date(`${dates[0]}T00:00:00`)
  const heatData: LevelDatum[] = daily.map((d) => {
    const date = new Date(`${d.key}T00:00:00`)
    const dayIndex = Math.floor((date.getTime() - start.getTime()) / 86400000)
    return {
      key: d.key,
      week: Math.floor((dayIndex + start.getDay()) / 7),
      weekday: date.getDay(),
      level: levelOf(d.value),
      full: d.full,
    }
  })

  const levelCounts: Record<Level, number> = {
    none: 0,
    low: 0,
    mid: 0,
    high: 0,
    full: 0,
  }
  for (const d of daily) levelCounts[levelOf(d.value)]++
  const donutData = LEVELS.map((id) => ({ id, value: levelCounts[id] }))

  const cartesian = {
    x: {
      scale: scalePoint,
      axis: {
        ticks: { format: xTick },
      },
    },
    y: {
      scale: () => scaleLinear().domain([0, 100]),
      grid: true,
      axis: { ticks: { count: 5 } },
    },
    tooltip,
  }

  // Point scale places the first/last point on the plot edges, which makes
  // bars overflow the chart. Bars use a band scale with outer padding instead.
  const barX = {
    scale: () => scaleBand<string>().paddingInner(0.3).paddingOuter(0.15),
    axis: {
      ticks: { format: xTick },
    },
  }

  switch (chartType) {
    case 'line':
      return defineChart({
        marks: [
          lineY(daily, {
            id: 'completion',
            x: 'key',
            y: 'value',
            key: 'key',
            stroke: hex.brand,
            strokeWidth: 2,
            points: true,
            curve: d3Curve(curveMonotoneX),
          }),
          ruleY([avg], {
            id: 'average',
            stroke: hex.ref,
            strokeWidth: 1,
            strokeDasharray: '4 4',
            strokeOpacity: 0.7,
          }),
        ],
        ...cartesian,
      })

    case 'area':
      return defineChart({
        marks: [
          areaY(daily, {
            id: 'completion',
            x: 'key',
            y: 'value',
            y1: 0,
            key: 'key',
            fill: hex.brand,
            fillOpacity: 0.25,
            stroke: hex.brand,
            strokeWidth: 2,
            curve: d3Curve(curveMonotoneX),
          }),
          ruleY([avg], {
            id: 'average',
            stroke: hex.ref,
            strokeWidth: 1,
            strokeDasharray: '4 4',
            strokeOpacity: 0.7,
          }),
        ],
        ...cartesian,
      })

    case 'bar':
      return defineChart({
        marks: [
          barY(daily, {
            id: 'completion',
            x: 'key',
            y: 'value',
            key: 'key',
            fill: hex.brand,
            radius: 3,
          }),
          ruleY([avg], {
            id: 'average',
            stroke: hex.ref,
            strokeWidth: 1,
            strokeDasharray: '4 4',
            strokeOpacity: 0.7,
          }),
        ],
        ...cartesian,
        x: barX,
      })

    case 'stacked-bar':
      return defineChart({
        marks: [
          barY(stackData, {
            id: 'stack',
            x: 'key',
            y: 'done',
            z: 'habitId',
            color: 'habitId',
            key: (d) => `${d.key}:${d.habitId}`,
            layout: stack(),
            radius: 3,
          }),
        ],
        x: barX,
        y: {
          scale: () => scaleLinear().domain([0, Math.max(1, habits.length)]),
          grid: true,
          axis: { ticks: { count: Math.min(5, habits.length + 1) } },
        },
        color: {
          domain: habits.map((h) => h.id),
          range: hex.series.slice(0, habits.length),
        },
        tooltip,
      })

    case 'heatmap':
      return defineChart({
        marks: [
          cell(heatData, {
            id: 'heat',
            x: 'week',
            y: 'weekday',
            color: 'level',
            key: 'key',
            inset: 2,
            radius: 3,
          }),
        ],
        x: {
          scale: () => scaleBand<number>().paddingInner(0.1).paddingOuter(0.1),
          axis: false,
        },
        y: {
          scale: () => scaleBand<number>().paddingInner(0.1).paddingOuter(0.1),
          axis: {
            line: false,
            ticks: {
              size: 0,
              padding: 4,
              format: (weekday) => WEEKDAYS[Number(weekday)],
            },
            tickLabels: { fontSize: 11, opacity: 0.7 },
          },
        },
        color: {
          scale: scaleOrdinal<string, string>()
            .domain(LEVELS)
            .range([
              hex.heat.none,
              hex.heat.low,
              hex.heat.mid,
              hex.heat.high,
              hex.heat.full,
            ]),
        },
        tooltip,
      })

    case 'radial': {
      const parts = [
        { id: 'done', value: avg },
        { id: 'rest', value: Math.max(0, 100 - avg) },
      ]
      const slices = pie(parts, {
        value: 'value',
        startAngle: -Math.PI * 0.75,
        endAngle: Math.PI * 0.75,
      })
      return defineChart({
        marks: [
          polar({
            id: 'progress',
            radiusRatio: 0.84,
            marks: [
              radialArc(slices, {
                id: 'progress-arc',
                innerRadius: ({ radius }) => radius * 0.72,
                cornerRadius: 999,
                color: 'id',
                key: 'id',
              }),
            ],
          }),
        ],
        color: {
          domain: ['done', 'rest'],
          range: [hex.brand, hex.empty],
        },
        tooltip,
      })
    }

    case 'donut': {
      const slices = pie(donutData, { value: 'value' })
      return defineChart({
        marks: [
          polar({
            id: 'donut',
            inset: 8,
            radiusRatio: 0.82,
            marks: [
              radialArc(slices, {
                id: 'donut-arc',
                innerRadius: ({ radius }) => radius * 0.55,
                cornerRadius: 4,
                color: 'id',
                key: 'id',
              }),
            ],
          }),
        ],
        color: {
          domain: [...LEVELS],
          range: [
            hex.heat.none,
            hex.heat.low,
            hex.heat.mid,
            hex.heat.high,
            hex.heat.full,
          ],
        },
        tooltip,
      })
    }

    case 'radar':
      return defineChart({
        marks: [
          polar({
            id: 'radar',
            radiusRatio: 0.72,
            angle: {
              scale: scalePoint<string>().domain(habitRows.map((r) => r.name)),
              wrap: true,
            },
            radius: { scale: scaleLinear().domain([0, 1]) },
            guides: [
              radialGrid({
                values: [0.25, 0.5, 0.75, 1],
                shape: 'polygon',
                labels: true,
                format: (value) => `${Math.round(Number(value) * 100)}%`,
                stroke: hex.grid,
                labelFill: hex.tick,
                labelFontSize: 10,
              }),
              angleGrid({
                labels: true,
                stroke: hex.grid,
                labelFill: hex.tick,
                labelFontSize: 11,
              }),
            ],
            marks: [
              radialArea(habitRows, {
                id: 'radar-area',
                angle: 'name',
                radius: 'normalized',
                curve: curveLinearClosed,
                fill: hex.brand,
                fillOpacity: 0.25,
              }),
              radialLine(habitRows, {
                id: 'radar-line',
                angle: 'name',
                radius: 'normalized',
                curve: curveLinearClosed,
                stroke: hex.brand,
                strokeWidth: 2,
              }),
              radialDot(habitRows, {
                id: 'radar-dot',
                angle: 'name',
                radius: 'normalized',
                key: 'name',
                r: 3,
                fill: hex.brand,
              }),
            ],
          }),
        ],
        tooltip,
      })
  }
}
