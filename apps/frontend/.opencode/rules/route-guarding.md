# Route Guarding & Authentication Rules

This project uses **TanStack Router** pathless layout routes combined with the `beforeLoad` hook to protect routes.
This project uses stateful auth method that token live in httponly cookie

---

## 1. Directory & Route Hierarchy

Guarded routes must live inside the `_auth` pathless layout directory. Any route placed outside `_auth` remains public.

```text
src/
└── routes/
    ├── __root.tsx          <-- Root layout (Providers, TanStack DevTools, etc.)
    ├── index.tsx           <-- Public Home Page (/)
    ├── .... public routes          
    ├── _auth.tsx           <-- Guarded Layout (Runs beforeLoad check for all children)
    └── _auth/              <-- All guarded routes live inside this directory
```

## 2. Guarded Layout (`/src/routes/_auth.tsx`)
```tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'


export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context }) => requireAuth(context.queryClient),
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div>
      <Outlet />
    </div>
  )
}
```
## 3. functions of guard (`/src/features/auth/guard.ts`)
```ts
import { redirect } from '@tanstack/react-router'
import { meQueryOptions } from '#/features/auth/api/auth.api'
import type { QueryClient } from '@tanstack/react-query'

export async function requireAuth(queryClient: QueryClient) {
  const data = await queryClient.fetchQuery(meQueryOptions)
  if (!data.success) {
    throw redirect({ to: '/login' })
  }
}

export async function redirectIfAuth(queryClient: QueryClient) {
  const data = await queryClient.fetchQuery(meQueryOptions)
  if (data.success) {
    throw redirect({ to: '/dashboard' })
  }
}
```
## 4. add fetch /me (`/src/features/auth/api/auth.api.ts`)
- after create fetch to api/me create named getCurrentUser : 
```ts
export const meQueryOptions = queryOptions({
  queryKey: ["me"],
  queryFn: getCurrentUser,
  staleTime: 1000 * 60 * 5,
  retry: false,
})
```
## 5. add hook in (`/src/features/auth/hooks/useAuth.ts`)
```ts
import { useQuery } from "@tanstack/react-query"
import { meQueryOptions } from "../api/auth.api"

export function useAuth() {
  return useQuery(meQueryOptions)
}
```
## 6. add in public routes (like login , signup , landing page ...):
```tsx
export const Route = createFileRoute('/public-route')({
  beforeLoad: ({ context }) => redirectIfAuth(context.queryClient),
  component: RouteComponent,
})
```


