import { ChevronDown, Search, X } from 'lucide-react'

import { cn } from '#/lib/utils'

import { ALL_ICONS, ICON_CATEGORIES, POPULAR_ICONS } from '../../data/icons'
import type { IconComponent } from '../../data/lucide-icons'
import { useIconPicker } from '../../hooks/use-icon-picker'
import { iconFor } from '../../lib/icon'

function IconButton({
  name,
  icon,
  selected,
  onSelect,
  label,
}: {
  name: string
  icon: IconComponent
  selected: boolean
  onSelect: (name: string) => void
  label: string
}) {
  const Icon = icon
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      onClick={() => onSelect(name)}
      className={cn(
        'flex h-8 cursor-pointer items-center justify-center rounded-md transition-all duration-200',
        selected
          ? 'bg-kaizen-mint text-kaizen-primary-dark ring-1 ring-kaizen-primary dark:text-kaizen-primary-light'
          : 'bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground'
      )}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  )
}

export function IconPicker({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (icon: string) => void
  label: string
}) {
  const { query, setQuery, showAll, setShowAll, results, recentIcons, select } =
    useIconPicker(value, onChange)

  return (
    <div role="group" aria-label={label} className="space-y-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search icons…"
          aria-label="Search icons"
          className="h-8 w-full rounded-md border border-border bg-card pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-kaizen-primary"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        )}
      </div>

      {query ? (
        results.length > 0 ? (
          <div className="grid grid-cols-8 gap-1.5">
            {results.map((r) => (
              <IconButton
                key={r.name}
                name={r.name}
                icon={r.icon}
                selected={value === r.name}
                onSelect={select}
                label={`${r.name} — ${r.keywords.join(', ')}`}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
            No icons match “{query}”.
          </p>
        )
      ) : (
        <>
          {recentIcons.length > 0 && (
            <div>
              <SectionLabel>Recently used</SectionLabel>
              <div className="grid grid-cols-8 gap-1.5">
                {recentIcons.map((e) => (
                  <IconButton
                    key={e}
                    name={e}
                    icon={iconFor(e)}
                    selected={value === e}
                    onSelect={select}
                    label={`Recently used ${e}`}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <SectionLabel>Popular</SectionLabel>
            <div className="grid grid-cols-8 gap-1.5">
              {POPULAR_ICONS.map((e) => (
                <IconButton
                  key={e.name}
                  name={e.name}
                  icon={e.icon}
                  selected={value === e.name}
                  onSelect={select}
                  label={`Popular ${e.name}`}
                />
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Categories</SectionLabel>
            <div className="space-y-3">
              {ICON_CATEGORIES.map((cat) => {
                const icons = showAll ? cat.icons : cat.icons.slice(0, 8)
                const CatIcon = cat.Icon
                return (
                  <div key={cat.id}>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <CatIcon className="size-3.5 text-muted-foreground" aria-hidden />
                      {cat.label}
                    </p>
                    <div className="grid grid-cols-8 gap-1.5">
                      {icons.map((i) => (
                        <IconButton
                          key={i.name}
                          name={i.name}
                          icon={i.icon}
                          selected={value === i.name}
                          onSelect={select}
                          label={`${cat.label} ${i.name}`}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {!showAll && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-md border border-border bg-muted/50 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-kaizen-primary/50 hover:text-kaizen-primary-dark dark:hover:text-kaizen-primary-light"
            >
              View all
              <ChevronDown className="size-3.5" aria-hidden />
            </button>
          )}
        </>
      )}
    </div>
  )
}

export { ALL_ICONS }