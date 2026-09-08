import { useTheme } from '#/providers/theme-provider'

export type ChartColors = {
  brand: string
  grid: string
  tick: string
  ref: string
  empty: string
  full: string
  /** Per-habit palette for stacked bars, radar, etc. */
  series: string[]
  /** Calendar-heatmap levels: none → full. */
  heat: Record<'none' | 'low' | 'mid' | 'high' | 'full', string>
}

const LIGHT: ChartColors = {
  brand: '#4caf7d',
  grid: '#e5ebe4',
  tick: '#64706a',
  ref: '#75897e',
  empty: '#e7ece5',
  full: '#3d9b6a',
  series: [
    '#4caf7d',
    '#3d7ab3',
    '#b06ab3',
    '#d08a3e',
    '#4a9db0',
    '#8b8f3d',
    '#c65c8a',
    '#7a6fd0',
  ],
  heat: {
    none: '#e7ece5',
    low: 'rgba(76, 175, 125, 0.35)',
    mid: 'rgba(76, 175, 125, 0.6)',
    high: 'rgba(61, 155, 106, 0.85)',
    full: '#3d9b6a',
  },
}

const DARK: ChartColors = {
  brand: '#6dc99a',
  grid: '#2a2e2c',
  tick: '#8a8f8d',
  ref: '#66796f',
  empty: '#262927',
  full: '#6dc99a',
  series: [
    '#6dc99a',
    '#7fb8e8',
    '#c99be0',
    '#e0b06d',
    '#7cc5d8',
    '#c3c96d',
    '#e08ab8',
    '#a89fe8',
  ],
  heat: {
    none: '#262927',
    low: 'rgba(109, 201, 154, 0.3)',
    mid: 'rgba(109, 201, 154, 0.55)',
    high: 'rgba(109, 201, 154, 0.8)',
    full: '#6dc99a',
  },
}

export function useChartColors(): ChartColors {
  const { theme } = useTheme()
  const resolved = theme === 'system' ? systemTheme() : theme
  return resolved === 'dark' ? DARK : LIGHT
}

function systemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** "#4caf7d" → "76, 175, 125" (for rgba() in inline styles). */
export function hexToRgb(hex: string) {
  const value = hex.replace('#', '')
  const n = parseInt(value, 16)
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
}
