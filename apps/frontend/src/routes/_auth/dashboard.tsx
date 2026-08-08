import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/_auth/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  return <div className="text-kaizen-charcoal p-8">Dashboard</div>
}
