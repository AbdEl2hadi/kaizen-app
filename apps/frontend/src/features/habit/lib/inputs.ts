import type { HabitInput, HabitInputType, HabitValue } from '../types'

export const INPUT_TYPES: readonly { value: HabitInputType; label: string }[] = [
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'percent', label: 'Percent (0–100)' },
  { value: 'select', label: 'Select' },
  { value: 'multiselect', label: 'Multi-select' },
  { value: 'date', label: 'Date' },
  { value: 'url', label: 'URL' },
  { value: 'files', label: 'Files' },
]

/** A value-based habit counts as done when it has a meaningful value. */
export function valueIsDone(input: HabitInput, value: HabitValue | undefined): boolean {
  if (input.type === 'checkbox') return value === 'true'
  if (input.type === 'percent') return value === '100'
  if (input.type === 'number') {
    const target = input.target ?? 1
    return Number(value) >= target
  }
  if (Array.isArray(value)) return value.length > 0
  return value != null && value.trim() !== ''
}
