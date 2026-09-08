import { createFileRoute } from '@tanstack/react-router'

import { ToDosPanel } from '#/features/habit/components/goals/to-dos-panel'

export const Route = createFileRoute('/_auth/habit/to-dos')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ToDosPanel />
}
