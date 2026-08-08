import { redirect } from '@tanstack/react-router'
import { meQueryOptions } from '#/features/auth/server/auth.server'
import type { QueryClient } from '@tanstack/react-query'

export async function requireAuth(queryClient: QueryClient) {
  const data = await queryClient.fetchQuery(meQueryOptions)
  if (!data.success) {
    throw redirect({ to: '/login' })
  }
}

export async function redirectIfAuth(queryClient: QueryClient) {
  const data = await queryClient.fetchQuery(meQueryOptions)
  if (data.success) {
    throw redirect({ to: '/dashboard' })
  }
}
