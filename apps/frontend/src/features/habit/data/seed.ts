import { addDays, toKey, todayKey } from '../lib/date'
import { valueIsDone } from '../lib/inputs'
import type { ArchivedHabit, Goal, Habit, HabitInput, Log } from '../types'

// Deterministic PRNG (mulberry32) so the seeded year always looks the same.
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type HabitDef = {
  id: string
  name: string
  icon: string
  rate: number
  input?: HabitInput
  createdAt: string
  archivedAt?: string
}

const YEAR_START = `${new Date().getFullYear()}-01-01`

const HABIT_DEFS: HabitDef[] = [
  { id: 'h1', name: 'No Scrolling', icon: 'Moon', rate: 0.8, createdAt: YEAR_START },
  { id: 'h2', name: '3h Read', icon: 'BookOpen', rate: 0.66, input: { type: 'number', target: 3 }, createdAt: YEAR_START },
  { id: 'h3', name: '1h Walk', icon: 'Footprints', rate: 0.72, input: { type: 'number', target: 1 }, createdAt: YEAR_START },
  { id: 'h4', name: 'Gym', icon: 'Dumbbell', rate: 0.54, createdAt: YEAR_START },
  { id: 'h5', name: '2L Water', icon: 'Droplets', rate: 0.88, input: { type: 'number', target: 2 }, createdAt: YEAR_START },
  { id: 'h6', name: '7h Sleep', icon: 'MoonStar', rate: 0.91, input: { type: 'percent' }, createdAt: YEAR_START },
  { id: 'h7', name: 'Journaling', icon: 'PenLine', rate: 0.62, input: { type: 'text' }, createdAt: YEAR_START },
  { id: 'h8', name: 'Meditation', icon: 'PersonStanding', rate: 0.76, input: { type: 'percent' }, createdAt: YEAR_START },
  { id: 'h9', name: '8h Deep Work', icon: 'Laptop', rate: 0.5, input: { type: 'number', target: 8 }, createdAt: YEAR_START },
  { id: 'h10', name: 'Daily Dose', icon: 'Pill', rate: 0.9, createdAt: YEAR_START },
]

// Archived habits are anchored to real dates in the recent past so their
// lifetime windows contain log data (the original demo used 2025 dates,
// which produced a permanent 0% lifetime completion).
const ARCHIVED_DEFS: HabitDef[] = [
  {
    id: 'h11',
    name: '15m Cleaning',
    icon: 'Brush',
    rate: 0.66,
    createdAt: YEAR_START,
    archivedAt: addDays(todayKey(), -140),
  },
  {
    id: 'h12',
    name: 'Read Before Bed',
    icon: 'Book',
    rate: 0.58,
    createdAt: YEAR_START,
    archivedAt: addDays(todayKey(), -30),
  },
]

const NOTES = [
  'Reading a morning but consistent',
  'Skipped gym, walked the dog longer',
  'Worked — good flow today',
  'Deadline crunch, deep work carried me',
  'Fell asleep late, catching up tomorrow',
  'Front-loaded the morning, felt great',
  'Long run + stretch after',
  'Hydrated all day — new habit!',
  'Meditation before bed, slept deep',
  'Missed the gym — moved to tomorrow',
  'No phones after 9pm 🎉',
  'Lunchtime walk in the park',
]

const TEXT_VALUES = [
  'Morning pages',
  'Reflected on the week',
  'Planned tomorrow',
  'Gratitude list',
  'Brain dump',
]

const CUR_YEAR = new Date().getFullYear()
const TODAY = new Date()

const rng = mulberry32(20260806)

function buildLog(): Log {
  const log: Log = {}
  const start = new Date(CUR_YEAR, 0, 1)
  const defs = [...HABIT_DEFS, ...ARCHIVED_DEFS]

  for (let d = new Date(start); d <= TODAY; d.setDate(d.getDate() + 1)) {
    const key = toKey(d)
    const dayIndex = Math.floor((d.getTime() - start.getTime()) / 86400000)
    // Slow sine wave of "good days", plus jitter → realistic correlated streaks
    const moodDay = 0.5 + 0.35 * Math.sin(dayIndex * 0.16) + (rng() - 0.5) * 0.5

    const checked: Record<string, boolean> = {}
    const values: Record<string, string> = {}
    for (const def of defs) {
      const active =
        key >= def.createdAt && (!def.archivedAt || key <= def.archivedAt)
      if (!active) continue
      const personal = (rng() - 0.5) * 0.36
      const p = Math.min(0.96, Math.max(0.015, def.rate + (moodDay - 0.5) * 0.9 + personal))

      if (def.input?.type === 'percent') {
        const v = Math.min(100, Math.round(82 + rng() * 36))
        values[def.id] = String(v)
        checked[def.id] = valueIsDone(def.input, values[def.id])
      } else if (def.input?.type === 'number') {
        const target = def.input.target ?? 1
        const v = Math.round((0.4 + rng() * 0.8) * target * 2) / 2
        values[def.id] = String(v)
        checked[def.id] = valueIsDone(def.input, values[def.id])
      } else if (def.input?.type === 'text') {
        if (rng() < p) {
          checked[def.id] = true
          values[def.id] = TEXT_VALUES[Math.floor(rng() * TEXT_VALUES.length)]
        }
      } else if (rng() < p) {
        checked[def.id] = true
      }
    }

    let note = ''
    if (rng() < 0.07 && Object.keys(checked).length > 0) {
      note = NOTES[Math.floor(rng() * NOTES.length)]
    }

    if (Object.keys(checked).length > 0 || Object.keys(values).length > 0 || note) {
      log[key] = { checked, values, note }
    }
  }
  return log
}

function buildHabits(): { active: Habit[]; archived: ArchivedHabit[] } {
  const active: Habit[] = HABIT_DEFS.map((h) => ({
    id: h.id,
    name: h.name,
    icon: h.icon,
    createdAt: h.createdAt,
    input: h.input ?? { type: 'checkbox' },
  }))
  const archived: ArchivedHabit[] = ARCHIVED_DEFS.map((h) => ({
    id: h.id,
    name: h.name,
    icon: h.icon,
    createdAt: h.createdAt,
    input: h.input ?? { type: 'checkbox' },
    archivedAt: h.archivedAt!,
  }))
  return { active, archived }
}

function buildGoals(): Goal[] {
  const future = (n: number) => {
    const d = new Date(TODAY)
    d.setDate(d.getDate() + n)
    return toKey(d)
  }
  return [
    { id: 'g1', title: 'Finish client proposal draft', due: toKey(TODAY), priority: 'high', done: false },
    { id: 'g2', title: 'Prep meal plan for the week', due: toKey(TODAY), priority: 'med', done: false },
    { id: 'g3', title: 'Book the dentist appointment', due: '', priority: 'low', done: false },
    { id: 'g4', title: 'Review Q3 roadmap with team', due: future(3), priority: 'high', done: false },
    { id: 'g5', title: 'Order replacement running shoes', due: future(5), priority: 'med', done: false },
    { id: 'g6', title: 'Deep-clean the garage', due: future(6), priority: 'low', done: false },
    { id: 'g7', title: 'Send invoice to Bluebird Studio', due: future(-1), priority: 'high', done: true },
    { id: 'g8', title: 'Set up the new monitor', due: future(-2), priority: 'med', done: true },
    { id: 'g9', title: 'Grease the bike chain', due: '', priority: 'low', done: true },
  ]
}

export function buildSeed() {
  const { active, archived } = buildHabits()
  return {
    habits: active,
    archivedHabits: archived,
    log: buildLog(),
    goals: buildGoals(),
  }
}
