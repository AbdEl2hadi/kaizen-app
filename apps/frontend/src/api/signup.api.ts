import { useMutation } from "@tanstack/react-query"

import type { SignUpFormData } from "#/schema/signup"
import type { ApiResponse } from "./types"

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000"

type UserData = { id: string; name: string; username: string; email: string }

export async function signupApi(
  payload: SignUpFormData,
): Promise<ApiResponse<UserData>> {
    await new Promise(resolve => setTimeout(resolve , 2000))
    const response = await fetch(`${SERVER_URL}/api/auth/signup`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      return {
        success : false,
        message : "An unexpected error occurred.",
      }
    }
  

  return response.json()
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: signupApi,
  })
}
