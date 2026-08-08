import { useState, useCallback } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema  } from '#/features/auth/schema/signup'
import type {SignUpFormData} from '#/features/auth/schema/signup';
import { useSignupMutation } from '#/features/auth/server/signup.server'



export function useSignUp() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    trigger,
    control,
    formState: { errors },
  } = useForm<SignUpFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
    },
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signupMutation = useSignupMutation()

  const onSubmit = useCallback(
    async (data: SignUpFormData) => {
      if (!agreeTerms) return

      setError(null)
      try {
        const res = await signupMutation.mutateAsync({
          data: {
            ...data,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        })
        if (res.success) {
          router.navigate({ to: '/verify-email', search: { email: data.email } })
        } else {
          setError(res.message!)
        }
      } catch (err) {
        console.error('[client] : ', err)
        setError(err instanceof Error ? err.message : 'Network error')
      }
    },
    [agreeTerms, router, signupMutation],
  )

  const handleConfirmBlur = useCallback(() => {
    trigger('confirmPassword')
  }, [trigger])

  return {
    register,
    handleSubmit,
    control,
    errors,
    isLoading: signupMutation.isPending,
    data: signupMutation.data,
    error,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    agreeTerms,
    setAgreeTerms,
    onSubmit,
    handleConfirmBlur,
  }
}
