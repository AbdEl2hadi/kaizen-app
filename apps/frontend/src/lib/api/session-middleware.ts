import { createMiddleware } from "@tanstack/react-start"
import {setResponseHeader , getRequestHeaders} from "@tanstack/react-start/server"


import type { SessionBridge } from "./server"

export const sessionMiddleware = createMiddleware({
  type: "request",
}).server(async ({ next }) => {
  const headers = getRequestHeaders()
  const pendingCookies: string[] = []

  const result = await next({
    context: {
      session: {
        cookie: headers.get("cookie") ?? undefined,
        setCookies: (values: string[]) => pendingCookies.push(...values),
      } satisfies SessionBridge,
    },
  })
  if (pendingCookies.length > 0) {
    setResponseHeader("Set-Cookie", pendingCookies)
  }

  return result
})