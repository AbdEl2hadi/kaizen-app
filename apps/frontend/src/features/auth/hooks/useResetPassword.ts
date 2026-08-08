import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema } from "#/features/auth/schema/reset-password"
import type { ResetPasswordFormData } from "#/features/auth/schema/reset-password"
import { useResetPasswordMutation } from "#/features/auth/server/reset-password.server"

export function useResetPassword(token: string) {
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isReset, setIsReset] = useState(false)

  const resetPasswordMutation = useResetPasswordMutation()

  const onSubmit = useCallback(
    async (data: ResetPasswordFormData) => {
      setError(null)
      try {
        const res = await resetPasswordMutation.mutateAsync({ data })
        if (res.success) {
          setIsReset(true)
        } else {
          setError(res.message ?? "Unable to reset your password")
        }
      } catch (err) {
        console.error("[client] error: ", err)
        setError(err instanceof Error ? err.message : "Network error")
      }
    },
    [resetPasswordMutation],
  )

  const handleConfirmBlur = useCallback(() => {
    trigger("confirmPassword")
  }, [trigger])

  return {
    register,
    handleSubmit,
    errors,
    isLoading: resetPasswordMutation.isPending,
    error,
    isReset,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleConfirmBlur,
    onSubmit,
  }
}