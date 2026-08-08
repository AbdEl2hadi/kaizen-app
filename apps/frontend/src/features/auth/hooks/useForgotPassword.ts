import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordSchema } from "#/features/auth/schema/forgot-password"
import type { ForgotPasswordFormData } from "#/features/auth/schema/forgot-password"
import { useForgotPasswordMutation } from "#/features/auth/server/forgot-password.server"

export function useForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })
  const [error, setError] = useState<string | null>(null)
  const [isSent, setIsSent] = useState(false)

  const forgotPasswordMutation = useForgotPasswordMutation()

  const onSubmit = useCallback(
    async (data: ForgotPasswordFormData) => {
      setError(null)
      try {
        const res = await forgotPasswordMutation.mutateAsync({ data })
        if (res.success) {
          setIsSent(true)
        } else {
          setError(res.message ?? "Unable to send password reset link")
        }
      } catch (err) {
        console.error("[client] error: ", err)
        setError(err instanceof Error ? err.message : "Network error")
      }
    },
    [forgotPasswordMutation],
  )

  return {
    register,
    handleSubmit,
    errors,
    isLoading: forgotPasswordMutation.isPending,
    error,
    isSent,
    onSubmit,
  }
}