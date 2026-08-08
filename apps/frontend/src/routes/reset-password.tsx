import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { redirectIfAuth } from '#/features/auth/guard'
import { ResetPasswordPage } from '#/components/auth/ResetPasswordPage'

const resetPasswordSearchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute('/reset-password')({
  validateSearch: resetPasswordSearchSchema,
  beforeLoad: ({ context }) => redirectIfAuth(context.queryClient),
  component: RouteComponent,
})

function RouteComponent() {
  const { token } = Route.useSearch()
  return <ResetPasswordPage token={token} />
}
