import { useState, useCallback } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '#/features/auth/schema/login'
import type { LoginFormData } from '#/features/auth/schema/login'
import { useLoginMutation } from '#/features/auth/server/login.server'


export function useLogin() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(loginSchema),
    defaultValues: { identity: '', password: '' },
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loginMutation = useLoginMutation()

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      setError(null)
      try {
        const res = await loginMutation.mutateAsync({data})   
        if (res.success) {
          router.navigate({ to: '/dashboard' })
        } else if (res.code === 'EMAIL_NOT_VERIFIED') {
          router.navigate({
            to: '/verify-email',
            search: { email: res.data?.email },
          })
        } else {
          setError(res.message ?? 'Login failed')
          reset()
        }
      } catch (err) {
        console.error('[client] : ', err)
        setError(err instanceof Error ? err.message : 'Network error')
        reset()
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
