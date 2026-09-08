import { useStore } from '@tanstack/react-store'

import { habitActions, habitStore } from '../store/habit-store'
import type { ChartType, Goal, Habit, HabitView, Log } from '../types'

export { habitActions }

export function useHabitView() {
  return useStore(habitStore, (s) => s.view)
}

export function useChartType() {
  return useStore(habitStore, (s) => s.chartType)
}

export function useHabitRange() {
  return useStore(habitStore, (s) => s.range)
}

export function useHabits() {
  return useStore(habitStore, (s) => s.habits)
}

export function useArchivedHabits() {
  return useStore(habitStore, (s) => s.archivedHabits)
}

export function useLog() {
  return useStore(habitStore, (s) => s.log)
}

export function useGoals() {
  return useStore(habitStore, (s) => s.goals)
}

export function useArchiveYear() {
  return useStore(habitStore, (s) => s.archiveYear)
}

export function useManageOpen() {
  return useStore(habitStore, (s) => s.manageOpen)
}

export function useRecentIcons() {
  return useStore(habitStore, (s) => s.recentIcons)
}

export type { ChartType, Goal, Habit, HabitView, Log }
