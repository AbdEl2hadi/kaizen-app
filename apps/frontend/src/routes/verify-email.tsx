import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { VerifyEmailPage } from '#/features/auth/components/VerifyEmailPage'

const verifyEmailSearchSchema = z.object({
  token: z.string().optional(),
  email: z.string().optional(),
})

export const Route = createFileRoute('/verify-email')({
  validateSearch: verifyEmailSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { token, email } = Route.useSearch()
  return <VerifyEmailPage token={token} email={email} />
}
