import { cn } from '#/lib/utils'

type SegmentedOption<T extends string> = {
  value: T
  label: string
}

type SegmentedToggleProps<T extends string> = {
  options: readonly SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedToggleProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex items-center rounded-lg border border-border bg-card p-0.5"
    >
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              'cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-200',
              selected
                ? 'bg-secondary font-semibold text-foreground shadow-[inset_0_0_0_1px_var(--border)]'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
