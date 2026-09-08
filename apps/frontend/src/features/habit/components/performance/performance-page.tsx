import { PerformanceGrid } from './performance-grid'
import { ArchiveHabits } from './archive-habits'

export function PerformancePage() {
  return (
    <div className="flex flex-col gap-8">
      <PerformanceGrid />
      <ArchiveHabits />
    </div>
  )
}
