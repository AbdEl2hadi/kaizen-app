import { createFileRoute } from '@tanstack/react-router'
import { redirectIfAuth } from '#/features/auth/guard'
import { LoginPage } from '#/components/auth/LoginPage'

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => redirectIfAuth(context.queryClient),
  component: LoginPage,
})
