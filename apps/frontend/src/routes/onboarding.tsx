import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/onboarding')({
  component: Onboarding,
})

function Onboarding() {
  return <div className="text-kaizen-charcoal p-8">Onboarding</div>
}
