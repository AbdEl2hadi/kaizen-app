import { useMutation } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"

import { sessionMiddleware } from "#/lib/api/session-middleware"
import { apiServer } from "#/lib/api/server"
import { forgotPasswordSchema } from "#/features/auth/schema/forgot-password"

export const forgotPasswordServerFn = createServerFn({ method: "POST" })
  .validator(forgotPasswordSchema)
  .middleware([sessionMiddleware])
  .handler(({ data, context }) =>
    apiServer<null>(
      "/auth/forgot-password",
      { method: "POST", body: JSON.stringify(data) },
      context.session,
    ),
  )

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: forgotPasswordServerFn,
  })
}
