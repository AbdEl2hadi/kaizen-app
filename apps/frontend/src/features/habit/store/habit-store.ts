import { createStore } from '@tanstack/store'

import { buildSeed } from '../data/seed'
import { todayKey } from '../lib/date'
import { valueIsDone } from '../lib/inputs'
import type {
  ArchivedHabit,
  ChartType,
  Goal,
  Habit,
  HabitInput,
  HabitValue,
  HabitView,
  Log,
} from '../types'

type HabitState = {
  view: HabitView
  range: number
  chartType: ChartType
  habits: Habit[]
  archivedHabits: ArchivedHabit[]
  log: Log
  goals: Goal[]
  archiveYear: number
  manageOpen: boolean
  recentIcons: string[]
}

function uid(prefix: string) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

const MAX_RECENT_ICONS = 8

function useIcon(state: HabitState, icon: string): string[] {
  return [icon, ...state.recentIcons.filter((e) => e !== icon)].slice(0, MAX_RECENT_ICONS)
}

function createInitialState(): HabitState {
  const seed = buildSeed()
  return {
    view: 'table',
    range: 7,
    chartType: 'line',
    habits: seed.habits,
    archivedHabits: seed.archivedHabits,
    log: seed.log,
    goals: seed.goals,
    archiveYear: new Date().getFullYear(),
    manageOpen: false,
    recentIcons: [],
  }
}

function actions(state: HabitState) {
  return {
    setView: (view: HabitView) => ({ ...state, view }),
    setRange: (range: number) => ({ ...state, range }),
    setChartType: (chartType: ChartType) => ({ ...state, chartType }),
    setArchiveYear: (year: number) => ({ ...state, archiveYear: year }),
    setManageOpen: (open: boolean) => ({ ...state, manageOpen: open }),

    toggleDayHabit: (date: string, habitId: string) => {
      const entry = state.log[date] ?? { checked: {}, values: {}, note: '' }
      const checked = { ...entry.checked }
      if (checked[habitId]) delete checked[habitId]
      else checked[habitId] = true
      return {
        ...state,
        log: { ...state.log, [date]: { ...entry, checked } },
      }
    },

    setHabitValue: (date: string, habitId: string, value: HabitValue) => {
      const habit = state.habits.find((h) => h.id === habitId)
      if (!habit) return state
      const entry = state.log[date] ?? { checked: {}, values: {}, note: '' }
      return {
        ...state,
        log: {
          ...state.log,
          [date]: {
            ...entry,
            values: { ...entry.values, [habitId]: value },
            checked: {
              ...entry.checked,
              [habitId]: valueIsDone(habit.input, value),
            },
          },
        },
      }
    },

    setNote: (date: string, note: string) => {
      const entry = state.log[date] ?? { checked: {}, values: {}, note: '' }
      return { ...state, log: { ...state.log, [date]: { ...entry, note } } }
    },

    addGoal: (title: string, due: string, priority: Goal['priority']) => {
      const goal: Goal = { id: uid('g'), title, due, priority, done: false }
      return { ...state, goals: [goal, ...state.goals] }
    },

    toggleGoal: (id: string) => ({
      ...state,
      goals: state.goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)),
    }),

    deleteGoal: (id: string) => ({
      ...state,
      goals: state.goals.filter((g) => g.id !== id),
    }),

    addHabit: (name: string, icon: string, input: HabitInput) => {
      const habit: Habit = { id: uid('h'), name, icon, createdAt: todayKey(), input }
      return { ...state, habits: [...state.habits, habit], recentIcons: useIcon(state, icon) }
    },

    editHabit: (id: string, name: string, icon: string) => ({
      ...state,
      habits: state.habits.map((h) => (h.id === id ? { ...h, name, icon } : h)),
      archivedHabits: state.archivedHabits.map((h) =>
        h.id === id ? { ...h, name, icon } : h
      ),
      recentIcons: useIcon(state, icon),
    }),

    archiveHabit: (id: string) => {
      const habit = state.habits.find((h) => h.id === id)
      if (!habit) return state
      return {
        ...state,
        habits: state.habits.filter((h) => h.id !== id),
        archivedHabits: [...state.archivedHabits, { ...habit, archivedAt: todayKey() }],
      }
    },

    restoreHabit: (id: string) => {
      const habit = state.archivedHabits.find((h) => h.id === id)
      if (!habit) return state
      const { archivedAt: _archivedAt, ...rest } = habit
      return {
        ...state,
        archivedHabits: state.archivedHabits.filter((h) => h.id !== id),
        habits: [...state.habits, { ...rest }],
      }
    },
  }
}

export const habitStore = createStore(createInitialState())

function commit(mutate: (state: HabitState) => HabitState) {
  habitStore.setState((state) => mutate(state))
}

export const habitActions = {
  setView: (view: HabitView) => commit((s) => actions(s).setView(view)),
  setRange: (range: number) => commit((s) => actions(s).setRange(range)),
  setChartType: (chartType: ChartType) =>
    commit((s) => actions(s).setChartType(chartType)),
  setArchiveYear: (year: number) => commit((s) => actions(s).setArchiveYear(year)),
  setManageOpen: (open: boolean) => commit((s) => actions(s).setManageOpen(open)),
  toggleDayHabit: (date: string, habitId: string) =>
    commit((s) => actions(s).toggleDayHabit(date, habitId)),
  setHabitValue: (date: string, habitId: string, value: HabitValue) =>
    commit((s) => actions(s).setHabitValue(date, habitId, value)),
  setNote: (date: string, note: string) => commit((s) => actions(s).setNote(date, note)),
  addGoal: (title: string, due: string, priority: Goal['priority']) =>
    commit((s) => actions(s).addGoal(title, due, priority)),
  toggleGoal: (id: string) => commit((s) => actions(s).toggleGoal(id)),
  deleteGoal: (id: string) => commit((s) => actions(s).deleteGoal(id)),
  addHabit: (name: string, icon: string, input: HabitInput) =>
    commit((s) => actions(s).addHabit(name, icon, input)),
  editHabit: (id: string, name: string, icon: string) =>
    commit((s) => actions(s).editHabit(id, name, icon)),
  archiveHabit: (id: string) => commit((s) => actions(s).archiveHabit(id)),
  restoreHabit: (id: string) => commit((s) => actions(s).restoreHabit(id)),
}
