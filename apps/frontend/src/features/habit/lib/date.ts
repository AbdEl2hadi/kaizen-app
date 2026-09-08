const pad = (n: number) => String(n).padStart(2, '0')

export function toKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function fromKey(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayKey() {
  return toKey(new Date())
}

export function todayDate() {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return t
}

export function addDays(key: string, num: number) {
  const d = fromKey(key)
  d.setDate(d.getDate() + num)
  return toKey(d)
}

/**
 * Day keys of the window the backend serves for a range, oldest → newest.
 * Mirrors `GetWeekLogs` (calendar week, Sun–Sat) and `GetMonthLogs` (calendar
 * month) so the frontend window always matches what the backend returns.
 */
export function logDays(range: number, date: string): string[] {
  if (range === 7) {
    const d = fromKey(date)
    const start = new Date(d)
    start.setDate(d.getDate() - d.getDay())
    const out: string[] = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      out.push(toKey(day))
    }
    return out
  }
  const year = Number(date.slice(0, 4))
  const month = Number(date.slice(5, 7)) - 1
  return monthKeys(year, month)
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

/** All day keys of a month, oldest → newest. */
export function monthKeys(year: number, month: number) {
  const count = daysInMonth(year, month)
  const out: string[] = []
  for (let day = 1; day <= count; day++) {
    out.push(`${year}-${pad(month + 1)}-${pad(day)}`)
  }
  return out
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/** e.g. "Mon · Aug 11" */
export function shortLabel(key: string) {
  const d = fromKey(key)
  return `${WEEKDAYS[d.getDay()]} · ${MONTHS[d.getMonth()]} ${d.getDate()}`
}

/** Years present in a set of date keys, newest → oldest. */
export function yearsIn(keys: readonly string[]) {
  return [...new Set(keys.map((k) => Number(k.slice(0, 4))))].sort((a, b) => b - a)
}
