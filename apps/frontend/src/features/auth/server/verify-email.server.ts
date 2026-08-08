import { useMutation } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { sessionMiddleware } from "#/lib/api/session-middleware"
import { apiServer } from "#/lib/api/server"

const verifyEmailSchema = z.object({
  token: z.string().min(1, { error: "Token is required" }),
})

export const verifyEmailFn = createServerFn({ method: "POST" })
  .validator(verifyEmailSchema)
  .middleware([sessionMiddleware])
  .handler(({ data, context }) =>
    apiServer<null>(
      `/auth/verify-email?token=${encodeURIComponent(data.token)}`,
      { method: "POST" },
      context.session,
    ),
  )

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: verifyEmailFn,
  })
}