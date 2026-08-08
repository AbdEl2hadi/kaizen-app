# API Handling

## Philosophy

- Every backend endpoint belongs to its owning feature and lives in a `server/` folder.
- All backend communication MUST go through TanStack Start **server functions** (`createServerFn`).
- Never call `fetch`/`axios` directly from components or hooks.
- Components only interact with custom hooks; hooks only call the exposed server functions.
- Every request must return a normalized `ApiResponse<T>`.

## 1. Server functions (`src/features/<feature>/server/*.server.ts`)

Each endpoint is a `createServerFn` that proxies to the backend through the shared `apiServer`
helper. The handler runs on the server; the client calls it over an RPC bridge.

```ts
import { createServerFn } from "@tanstack/react-start"
import { sessionMiddleware } from "#/lib/api/session-middleware"
import { apiServer } from "#/lib/api/server"
import { loginSchema } from "../schema/login"
import type { User } from "#/features/auth/types"

export const loginServerFn = createServerFn({ method: "POST" })
  .validator(loginSchema)
  .middleware([sessionMiddleware])
  .handler(({ data, context }) =>
    apiServer<User>(
      "/auth/login",
      { method: "POST", body: JSON.stringify(data) },
      context.session,
    ),
  )
```

Rules:

- Add `.validator(schema)` with a Zod schema for every payload.
- Add `sessionMiddleware` for endpoints that read the session cookie or set cookies.
- `apiServer` requires the backend path **without** the `/v1` prefix (it is added internally).
- Handlers never import `@tanstack/start`/server work; bridging lives in `apiServer`.

## 2. Shared helper (`src/lib/api/server.ts`)

```ts
export type ApiResponse<T = unknown> = {
  success: boolean
  message?: string
  data?: T
}

apiServer<T>(path, init?, session?): Promise<ApiResponse<T>>
```

- Always returns a normalized `ApiResponse<T>`; never throws for expected failures.
- Forwards the browser `Cookie` header so authenticated endpoints work server-side.
- Forwards backend `Set-Cookie` values back to the client (via `sessionMiddleware`),
  keeping the HttpOnly session cookie flow working.
- Applies a default 10s timeout and JSON headers.
- Never returns raw `Response`/Axios objects.

## 3. Client exposure

Export the React Query integration from the same `.server.ts` file. Hooks must only do
UI/state orchestration; network logic stays in the server function.

```ts
export const meQueryOptions = queryOptions({
  queryKey: ["me"],
  queryFn: () => getCurrentUserFn(),
  staleTime: 1000 * 60 * 5,
  retry: false,
})

export function useAuth() {
  return useQuery(meQueryOptions)
}
```

Mutations:

```ts
export function useLoginMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: loginServerFn,
    onSuccess: (res) =>
      res.success && queryClient.invalidateQueries({ queryKey: ["me"] }),
  })
}
```

Rules:

- Use stable query keys, never random/unstable values.
- Invalidate affected queries on success.
- Components never call `useQuery()`/`useMutation()` directly without a good reason.

## 4. Error handling

`apiServer` already normalizes failures:

- Backend errors are returned as `{ success: false, message }` when the backend responds.
- Unexpected failures return a generic message.
- Expected API errors are never thrown.

## Naming

Functions: `login`, `logout`, `getCurrentUser`, `signup`, `verifyEmail`

Hooks: `useLogin`, `useLogout`, `useAuth`, `useSignup`, `useVerifyEmail`

Files: `login.server.ts`, `logout.server.ts`, `auth.server.ts`, `resend-verify-email.server.ts`

## Avoid

- Calling `fetch` or `axios` in components/hooks.
- Creating multiple HTTP clients.
- Duplicating `apiServer` logic across features.
- Mixing UI logic with networking logic.