import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"

import { sessionMiddleware } from "#/lib/api/session-middleware"
import { apiServer  } from "#/lib/api/server"
import { loginSchema } from "#/features/auth/schema/login"
import type { User } from "#/features/auth/types"




export const loginServerFn = createServerFn({ method: "POST" })
  .validator(loginSchema)
  .middleware([sessionMiddleware])
  .handler(({ data, context }) =>
    apiServer<User, { email: string }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify(data) },
      context.session,
    ),
  )

export function useLoginMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: loginServerFn,
    onSuccess: (res) =>
      res.success &&
      queryClient.invalidateQueries({ queryKey: ["me"] }),
  })
}