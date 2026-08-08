import { createFileRoute } from '@tanstack/react-router'
import { redirectIfAuth } from '#/features/auth/guard'
import { SignUpPage } from '#/components/auth/SignUpPage'

export const Route = createFileRoute('/signup')({
  beforeLoad: ({ context }) => redirectIfAuth(context.queryClient),
  component: SignUpPage,
})
