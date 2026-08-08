import { queryOptions, useQuery } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"

import { sessionMiddleware } from "#/lib/api/session-middleware"
import { apiServer } from "#/lib/api/server"
import type { User } from "#/features/auth/types"

export const getCurrentUserFn = createServerFn({ method: "GET" })
  .middleware([sessionMiddleware])
  .handler(({ context }) =>
    apiServer<User>("/api/me", undefined, context.session),
  )

export const meQueryOptions = queryOptions({
  queryKey: ["me"],
  queryFn: () => getCurrentUserFn(),
  staleTime: 1000 * 60 * 5,
  retry: false,
})

export function useAuth() {
  return useQuery(meQueryOptions)
}