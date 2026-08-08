import { env } from "../env"
import type { ApiResponse } from "./types"




export type SessionBridge = {
  cookie?: string
  setCookies: (values: string[]) => void
}

export async function apiServer<T, TError = never>(
  path: string,
  init?: RequestInit,
  session?: SessionBridge,
): Promise<ApiResponse<T, TError>> {
  try {

    const mergedHeaders = new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    })
    if (session?.cookie) mergedHeaders.set('Cookie', session.cookie)
    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => mergedHeaders.set(key, value))
    }


    const response = await fetch(`${env.VITE_SERVER_URL}/v1${path}`, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(10_000),
      headers: mergedHeaders,
        })

    const result = (await response.json()) as ApiResponse<T>

    if (session) {
      const setCookies = response.headers.getSetCookie()
    if (setCookies.length > 0) {
      session.setCookies(setCookies)
    }}

    if (!result.success) {
      console.error(`[server] ${path} → ${response.status}:`, result.message)
    }


    return result
  } catch (err) {
    console.error(`[server] request failed (${path}):`, err)
    return {
      success: false,
      message: "Unable to connect to the server. Please try again.",
    }
  }
}