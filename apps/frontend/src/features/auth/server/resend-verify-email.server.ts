import { useMutation } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { sessionMiddleware } from "#/lib/api/session-middleware"
import { apiServer } from "#/lib/api/server"

const resendVerificationSchema = z.object({
  email: z.email({ error: "Enter a valid email address" }),
})

export const resendVerificationEmailFn = createServerFn({ method: "POST" })
  .validator(resendVerificationSchema)
  .middleware([sessionMiddleware])
  .handler(({ data, context }) =>
    apiServer<null>(
      "/auth/resend-verification",
      { method: "POST", body: JSON.stringify(data) },
      context.session,
    ),
  )

export function useResendVerificationEmailMutation() {
  return useMutation({
    mutationFn: resendVerificationEmailFn,
  })
}