import { useMemo } from 'react'

import { yearsIn } from '../lib/date'
import { habitActions, useArchiveYear, useLog } from './use-habit-store'

export function usePerformanceYears() {
  const log = useLog()
  const archiveYear = useArchiveYear()

  const years = useMemo(() => yearsIn(Object.keys(log)), [log])
  const year = years.length ? archiveYear : new Date().getFullYear()

  return { years, year, setYear: habitActions.setArchiveYear }
}
