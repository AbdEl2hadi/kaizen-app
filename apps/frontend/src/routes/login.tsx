import { createFileRoute } from '@tanstack/react-router'
import { redirectIfAuth } from '#/features/auth/guard'
import { LoginPage } from '#/features/auth/components/LoginPage'

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => redirectIfAuth(context.queryClient),
  component: LoginPage,
})
