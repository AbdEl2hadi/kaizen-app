import { useState, useCallback } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema  } from '#/schema/signup'
import type {SignUpFormData} from '#/schema/signup';
import { useSignupMutation } from '#/api/signup.api'

export function useSignUp() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<SignUpFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
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
        const res = await signupMutation.mutateAsync(data)
        if (res.success) {
          router.navigate({ to: '/onboarding' })
        } else {
          setError(res.message!)
        }
      } catch (err) {
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
