import { Link } from '@tanstack/react-router'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Checkbox } from '#/components/ui/checkbox'
import { AuthLayout } from './AuthLayout'
import { useLogin } from '#/hooks/useLogin'

const inputClass =
  'w-full rounded-xl border border-[#e0e0e0] px-3 py-2 pr-8 text-xs text-kaizen-charcoal placeholder:text-kaizen-gray-light outline-none dark:border-[#333] dark:bg-[#1a1d1b] dark:text-white sm:px-4 sm:py-2.5 sm:pr-10 sm:text-sm'

export function LoginPage() {
  const {
    register,
    handleSubmit,
    errors,
    isLoading,
    error,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    onSubmit,
  } = useLogin()

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue your kaizen journey"
      tagline='"Consistency over perfection — every login is a win."'
      mascotPose="walking"
      proofCard={
        <div className="rounded-2xl bg-white/90 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm dark:bg-[#1a1d1b]/90">
          <p className="text-kaizen-charcoal text-sm font-semibold">
            You're 3 days into your streak!
          </p>
          <p className="text-kaizen-gray text-xs">Keep it going</p>
        </div>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-4 space-y-4 sm:mt-6 sm:space-y-5"
        noValidate
      >
        <div>
          <label
            htmlFor="login-email"
            className="text-kaizen-charcoal mb-1.5 block text-xs font-medium sm:text-sm dark:text-white"
          >
            Email or username
          </label>
          <div className="relative">
            <input
              id="login-email"
              type="text"
              {...register('email')}
              className={inputClass}
              placeholder="jane@example.com or username"
            />
          </div>
          {errors.email && (
            <p className="mt-0.5 text-[10px] text-[#FF6F5E] sm:text-xs">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="text-kaizen-charcoal mb-1.5 block text-xs font-medium sm:text-sm dark:text-white"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className={inputClass}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-kaizen-gray hover:text-kaizen-charcoal absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer dark:hover:text-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-0.5 text-[10px] text-[#FF6F5E] sm:text-xs">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={rememberMe}
              onCheckedChange={(v) => setRememberMe(v === true)}
              className="border-[#e0e0e0] focus-visible:ring-[#4CAF7D]/50 data-[state=checked]:border-[#4CAF7D] data-[state=checked]:bg-[#4CAF7D] data-[state=checked]:text-black dark:border-[#333] dark:data-[state=checked]:text-white"
            />
            <span className="text-kaizen-gray text-[10px] sm:text-xs">
              Remember me
            </span>
          </label>
          <Link
            to="/forgot-password"
            className="text-[10px] font-medium text-[#4CAF7D] hover:text-[#3d9b6a] sm:text-xs"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#4CAF7D] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:bg-[#3d9b6a] disabled:cursor-not-allowed disabled:opacity-50 sm:py-2.5 sm:text-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Logging you in...
            </>
          ) : (
            'Log in'
          )}
        </button>

        {error && (
          <p className="text-center text-[10px] text-[#FF6F5E] sm:text-xs">
            {error}
          </p>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e0e0e0] dark:border-[#333]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="text-kaizen-gray bg-white px-2 dark:bg-[#141715]">
              or continue with
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => console.log('google auth')}
            className="text-kaizen-charcoal flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#e0e0e0] px-2 py-2 text-[10px] font-medium transition-colors hover:bg-[#f8faf5] sm:px-4 sm:py-2.5 sm:text-sm dark:border-[#333] dark:text-white dark:hover:bg-[#1a1d1b]"
          >
            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => console.log('apple auth')}
            className="text-kaizen-charcoal flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#e0e0e0] px-2 py-2 text-[10px] font-medium transition-colors hover:bg-[#f8faf5] sm:px-4 sm:py-2.5 sm:text-sm dark:border-[#333] dark:text-white dark:hover:bg-[#1a1d1b]"
          >
            <svg
              className="h-3.5 w-3.5 sm:h-4 sm:w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Continue with Apple
          </button>
        </div>

        <p className="text-kaizen-gray text-center text-[10px] sm:text-xs">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-medium text-[#4CAF7D]! underline! underline-offset-2 hover:text-[#3d9b6a] dark:text-[#4CAF7D]!"
          >
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
