import { createFileRoute } from '@tanstack/react-router'

import { DailyLogPage } from '#/features/habit/components/daily-log/daily-log-page'

export const Route = createFileRoute('/_auth/habit/daily-log')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DailyLogPage />
}
