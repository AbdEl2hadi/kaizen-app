import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/habit/performance')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/habit/performance"!</div>
}
