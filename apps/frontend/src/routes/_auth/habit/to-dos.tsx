import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/habit/to-dos')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/habit/to-dos"!</div>
}
