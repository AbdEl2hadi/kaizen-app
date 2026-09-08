import { useCallback, useMemo, useState } from 'react'

import { searchIcons } from '../data/icons'
import { useRecentIcons } from './use-habit-store'

const MAX_RECENT = 8

export function useIconPicker(
  value: string,
  onChange: (icon: string) => void
) {
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  const recent = useRecentIcons()

  const results = useMemo(() => searchIcons(query), [query])

  const recentIcons = useMemo(
    () => recent.filter((e) => e !== value).slice(0, MAX_RECENT),
    [recent, value]
  )

  const select = useCallback(
    (icon: string) => {
      onChange(icon)
      setQuery('')
      setShowAll(false)
    },
    [onChange]
  )

  return { query, setQuery, showAll, setShowAll, results, recentIcons, select }
}
