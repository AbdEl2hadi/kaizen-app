import { useState, useCallback } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '#/schema/login'
import type { LoginFormData } from '#/schema/login'
import { useLoginMutation } from '#/api/login.api'

export function useLogin() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loginMutation = useLoginMutation()

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      setError(null)
      try {
        const res = await loginMutation.mutateAsync(data)
        if (res.success) {
          router.navigate({ to: '/dashboard' })
        } else {
          setError(res.message ?? 'Login failed')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error')
      }
    },
    [router, loginMutation],
  )

  return {
    register,
    handleSubmit,
    errors,
    isLoading: loginMutation.isPending,
    data: loginMutation.data,
    error,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    onSubmit,
  }
}
