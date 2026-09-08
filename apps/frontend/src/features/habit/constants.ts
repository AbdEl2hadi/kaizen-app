import type { Priority } from './types'

export const PRIORITY_STYLES: Record<Priority, string> = {
  high: 'bg-red-100 text-red-700 border border-red-300/50 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
  med: 'bg-kaizen-mint text-kaizen-primary-dark border border-kaizen-primary/30 dark:text-kaizen-primary-light',
  low: 'bg-muted text-muted-foreground border border-border',
}

export const PRIORITY_SELECTED: Record<Priority, string> = {
  high: 'bg-red-100 font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-400',
  med: 'bg-kaizen-mint font-semibold text-kaizen-primary-dark dark:text-kaizen-primary-light',
  low: 'bg-muted font-semibold text-foreground',
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: 'High',
  med: 'Med',
  low: 'Low',
}

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
