import { toKey, todayKey } from './date'
import type { ArchivedHabit, Goal, Habit, Log, Status } from '../types'

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

/**
 * Contribution of a habit on a date: percent habits give their value/100,
 * number habits give value/target (capped), everything else is 0 or 1.
 */
export function contributionOf(log: Log, habit: Habit | ArchivedHabit, date: string) {
  if (habit.input.type === 'percent') {
    const v = Number(log[date]?.values[habit.id])
    return Number.isFinite(v) ? clamp01(v / 100) : 0
  }
  if (habit.input.type === 'number') {
    const v = Number(log[date]?.values[habit.id])
    const target = habit.input.target ?? 1
    return Number.isFinite(v) ? clamp01(v / target) : 0
  }
  return log[date]?.checked[habit.id] ? 1 : 0
}

/** Habits fully checked on a date; missing entries count as none. */
export function dayChecked(log: Log, habits: readonly Habit[], date: string) {
  const entry = log[date]
  if (!entry) return []
  return habits.filter((h) => entry.checked[h.id])
}

export function dayPct(log: Log, habits: readonly Habit[], date: string) {
  if (habits.length === 0) return 0
  const sum = habits.reduce((acc, h) => acc + contributionOf(log, h, date), 0)
  return Math.round((sum / habits.length) * 100)
}

export function statusFor(pct: number, habitCount: number): Status {
  if (habitCount === 0) return { emoji: '·', label: 'No habits', tone: 'muted' }
  if (pct === 0) return { emoji: '📝', label: 'Start logging', tone: 'warn' }
  if (pct < 40) return { emoji: '🔥', label: 'Keep it up', tone: 'fire' }
  if (pct < 70) return { emoji: '💪', label: 'Try harder', tone: 'warn' }
  return { emoji: '✅', label: 'Well done', tone: 'ok' }
}

/** Completion % of a (possibly archived) habit across its lifetime window. */
export function lifetimeCompletion(log: Log, habit: Habit | ArchivedHabit) {
  const start = habit.createdAt || '1900-01-01'
  const end = 'archivedAt' in habit && habit.archivedAt ? habit.archivedAt : todayKey()
  let total = 0
  let sum = 0
  for (const date in log) {
    if (date >= start && date <= end) {
      total++
      sum += contributionOf(log, habit, date)
    }
  }
  return total ? Math.round((sum / total) * 100) : 0
}

/** Bucket goals into today / later-this-week / later / done. */
export function goalBuckets(goals: readonly Goal[]) {
  const today = todayKey()
  const inWeek = new Set<string>()
  for (let i = 0; i <= 6; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    inWeek.add(toKey(d))
  }
  const bucket = (g: Goal) => {
    if (g.done) return 'done'
    if (!g.due || g.due === today) return 'today'
    if (inWeek.has(g.due)) return 'week'
    return 'later'
  }
  return {
    today: goals.filter((g) => bucket(g) === 'today'),
    week: goals.filter((g) => bucket(g) === 'week'),
    later: goals.filter((g) => bucket(g) === 'later'),
    done: goals.filter((g) => bucket(g) === 'done'),
  }
}
