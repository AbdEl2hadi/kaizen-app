import { createFileRoute } from '@tanstack/react-router'
import { redirectIfAuth } from '#/features/auth/guard'
import { ForgotPasswordPage } from '#/components/auth/ForgotPasswordPage'

export const Route = createFileRoute('/forgot-password')({
  beforeLoad: ({ context }) => redirectIfAuth(context.queryClient),
  component: ForgotPasswordPage,
})
