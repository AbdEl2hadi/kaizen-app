import { useCallback, useRef } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { env } from '#/lib/env'
import { meQueryOptions } from '#/features/auth/server/auth.server'

const OAUTH_MESSAGE_TYPE = 'oauth:success'

export function useOAuthPopup() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const receivedSuccess = useRef(false)

  const handleOAuthMessage = useCallback(
    (event: MessageEvent) => {
      if (event.data?.type !== OAUTH_MESSAGE_TYPE) return

      receivedSuccess.current = true
      queryClient.invalidateQueries({ queryKey: meQueryOptions.queryKey })
      router.navigate({ to: '/dashboard' })
    },
    [router, queryClient],
  )

  const handleOAuthClose = useCallback(() => {
    if (receivedSuccess.current) return

    void queryClient
      .fetchQuery(meQueryOptions)
      .then((data) => {
        if (data.success) {
          router.navigate({ to: '/dashboard' })
          return
        }
        toast.error(
          'Sign-in was cancelled or failed. Close the popup and try again.',
        )
        receivedSuccess.current = false
      })
      .catch(() => {
        toast.error(
          'Sign-in was cancelled or failed. Close the popup and try again.',
        )
        receivedSuccess.current = false
      })
  }, [router, queryClient])

  const expectedOrigin =
    typeof window !== 'undefined' ? window.location.origin : ''

  return {
    googleUrl: `${env.VITE_SERVER_URL}/v1/auth/google`,
    facebookUrl: `${env.VITE_SERVER_URL}/v1/auth/facebook`,
    expectedOrigin,
    handleOAuthMessage,
    handleOAuthClose,
  }
}
