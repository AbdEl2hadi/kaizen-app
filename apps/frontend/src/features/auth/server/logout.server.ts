import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"

import { sessionMiddleware } from "#/lib/api/session-middleware"
import { apiServer } from "#/lib/api/server"

export const logoutServerFn = createServerFn({ method: "POST" })
  .middleware([sessionMiddleware])
  .handler(({ context }) =>
    apiServer<null>("/auth/logout", { method: "POST" }, context.session),
  )

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logoutServerFn,
    onSuccess: (res) =>
      res.success &&
      queryClient.invalidateQueries({ queryKey: ["me"] }),
  })
}