import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { sessionMiddleware } from "#/lib/api/session-middleware"
import { apiServer } from "#/lib/api/server"
import { signupSchema } from "#/features/auth/schema/signup"
import type { User } from "#/features/auth/types"

const signupServerSchema = signupSchema.extend({
  timeZone: z.string().min(1, { error: "Time zone is required" }),
})

export const signupServerFn = createServerFn({ method: "POST" })
  .validator(signupServerSchema)
  .middleware([sessionMiddleware])
  .handler(({ data, context }) =>
    apiServer<User>(
      "/auth/register",
      { method: "POST", body: JSON.stringify(data) },
      context.session,
    ),
  )

export function useSignupMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: signupServerFn,
    onSuccess: (res) =>
      res.success &&
      queryClient.invalidateQueries({ queryKey: ["me"] }),
  })
}