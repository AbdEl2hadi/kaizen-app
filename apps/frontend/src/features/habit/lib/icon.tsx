import type { LucideProps } from 'lucide-react'

import { cn } from '#/lib/utils'

import { ICON_CATEGORIES } from '../data/icons'
import { FALLBACK_ICON  } from '../data/lucide-icons'
import type {IconComponent} from '../data/lucide-icons';

const ICON_BY_NAME = new Map(
  ICON_CATEGORIES.flatMap((c) => c.icons).map((i) => [i.name, i.icon])
)

export function iconFor(name: string): IconComponent {
  return ICON_BY_NAME.get(name) ?? FALLBACK_ICON
}

export function HabitIcon({
  name,
  className,
  ...props
}: { name: string } & LucideProps) {
  const Icon = iconFor(name)
  return <Icon aria-hidden className={cn('size-3', className)} {...props} />
}
