import { useMutation } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"

import { sessionMiddleware } from "#/lib/api/session-middleware"
import { apiServer } from "#/lib/api/server"
import { resetPasswordSchema } from "#/features/auth/schema/reset-password"
import type { ResetPasswordFormData } from "#/features/auth/schema/reset-password"

export const resetPasswordServerFn = createServerFn({ method: "POST" })
  .validator(resetPasswordSchema)
  .middleware([sessionMiddleware])
  .handler(({ data, context }) => {
    const { token, password, confirmPassword } = data
    const payload: Omit<ResetPasswordFormData, "token"> = {
      password,
      confirmPassword,
    }
    return apiServer<null>(
      `/auth/reset-password?token=${encodeURIComponent(token)}`,
      { method: "POST", body: JSON.stringify(payload) },
      context.session,
    )
  })

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: resetPasswordServerFn,
  })
}
