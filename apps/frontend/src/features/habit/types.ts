



export type Priority = 'low' | 'med' | 'high'

export type HabitInputType =
  | 'checkbox'
  | 'text'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'percent'
  | 'date'
  | 'files'
  | 'url'

export type HabitInput = {
  type: HabitInputType
  /** Options for `select` / `multiselect` types. */
  options?: string[]
  /** Max/target value for `number` habits. */
  target?: number
}

export type Habit = {
  id: string
  name: string
  icon: string
  createdAt: string
  input: HabitInput
  /** Server-side display order; absent for store-only (seed) habits. */
  sortOrder?: number
}

export type ArchivedHabit = Habit & {
  archivedAt: string
}

export type HabitValue = string | string[]

export type DailyEntry = {
  checked: Record<string, boolean>
  values: Record<string, HabitValue>
  note: string
}

export type Log = Record<string, DailyEntry | undefined>

export type Goal = {
  id: string
  title: string
  due: string
  priority: Priority
  done: boolean
}

export type StatusTone = 'ok' | 'warn' | 'fire' | 'muted'

export type Status = {
  emoji: string
  label: string
  tone: StatusTone
}

export type HabitView = 'table' | 'chart'

export type ChartType =
  | 'line'
  | 'area'
  | 'bar'
  | 'stacked-bar'
  | 'heatmap'
  | 'radial'
  | 'donut'
  | 'radar'
