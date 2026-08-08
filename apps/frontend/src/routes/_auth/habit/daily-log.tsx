import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/habit/daily-log')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/habit/daily-log"!</div>
}
