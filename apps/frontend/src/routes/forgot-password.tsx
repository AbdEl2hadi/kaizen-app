import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPassword,
})

function ForgotPassword() {
  return <div className="text-kaizen-charcoal p-8">Forgot Password</div>
}
