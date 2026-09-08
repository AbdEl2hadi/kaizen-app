import { createFileRoute } from '@tanstack/react-router'

import { PerformancePage } from '#/features/habit/components/performance/performance-page'

export const Route = createFileRoute('/_auth/habit/performance')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PerformancePage />
}
