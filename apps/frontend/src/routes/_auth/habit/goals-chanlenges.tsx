import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/habit/goals-chanlenges')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/habit/goals-chanlenges"!</div>
}
