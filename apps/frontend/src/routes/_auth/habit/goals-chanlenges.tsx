import { createFileRoute } from '@tanstack/react-router'

import { GoalsPanel } from '#/features/habit/components/goals/goals-panel'

export const Route = createFileRoute('/_auth/habit/goals-chanlenges')({
  component: RouteComponent,
})

function RouteComponent() {
  return <GoalsPanel />
}
