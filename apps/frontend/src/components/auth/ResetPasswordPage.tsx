import { Link } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, XCircle } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { AuthLayout } from './AuthLayout'
import { useResetPassword } from '#/features/auth/hooks/useResetPassword'

const inputClass =
  'w-full rounded-xl border border-[#e0e0e0] px-3 py-2 pr-8 text-xs text-kaizen-charcoal placeholder:text-kaizen-gray-light outline-none dark:border-[#333] dark:bg-[#1a1d1b] dark:text-white sm:px-4 sm:py-2.5 sm:pr-10 sm:text-sm'

type ResetPasswordPageProps = {
  token?: string
}

export function ResetPasswordPage({ token }: ResetPasswordPageProps) {
  if (!token) {
    return <InvalidResetLink />
  }

  return <ResetPasswordForm token={token} />
}

function ResetPasswordForm({ token }: { token: string }) {
  const {
    register,
    handleSubmit,
    errors,
    isLoading,
    error,
    isReset,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleConfirmBlur,
    onSubmit,
  } = useResetPassword(token)

  if (isReset) {
    return <ResetSuccess />
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before"
      tagline='"Small steps lead to big changes. Start fresh, start strong."'
      mascotPose="celebrating"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-4 space-y-4 sm:mt-6 sm:space-y-5"
        noValidate
      >
        <div>
          <label
            htmlFor="reset-password"
            className="text-kaizen-charcoal mb-1.5 block text-xs font-medium sm:text-sm dark:text-white"
          >
            New password
          </label>
          <div className="relative">
            <input
              id="reset-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('password')}
              className={inputClass}
              placeholder="Create a strong password"
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

        <div>
          <label
            htmlFor="reset-confirm-password"
            className="text-kaizen-charcoal mb-1.5 block text-xs font-medium sm:text-sm dark:text-white"
          >
            Confirm new password
          </label>
          <div className="relative">
            <input
              id="reset-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('confirmPassword')}
              onBlur={handleConfirmBlur}
              className={inputClass}
              placeholder="Re-enter your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="text-kaizen-gray hover:text-kaizen-charcoal absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer dark:hover:text-white"
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-0.5 text-[10px] text-[#FF6F5E] sm:text-xs">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#4CAF7D] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:bg-[#3d9b6a] disabled:cursor-not-allowed disabled:opacity-50 sm:py-2.5 sm:text-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Resetting your password...
            </>
          ) : (
            'Reset password'
          )}
        </button>

        {error && (
          <p className="text-center text-[10px] text-[#FF6F5E] sm:text-xs">
            {error}
          </p>
        )}
      </form>
    </AuthLayout>
  )
}

function ResetSuccess() {
  return (
    <AuthLayout
      title="Password reset!"
      subtitle="Your password has been updated successfully"
      tagline='"Consistency over perfection — every login is a win."'
      mascotPose="celebrating"
    >
      <div className="mt-4 flex flex-col items-center rounded-2xl border border-[#e0e0e0] p-6 text-center sm:mt-6 dark:border-[#333]">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-kaizen-mint dark:bg-kaizen-mint/50">
          <CheckCircle2
            className="size-7 text-kaizen-primary animate-scale-in"
            aria-hidden="true"
          />
        </div>

        <p className="text-kaizen-charcoal text-sm font-medium sm:text-base dark:text-white">
          All done!
        </p>

        <p className="text-kaizen-gray mt-2 text-xs leading-relaxed sm:text-sm">
          You can now log in with your new password and get back to your
          kaizen journey.
        </p>

        <div className="mt-6 w-full">
          <Button size="lg" className="w-full cursor-pointer" asChild>
            <Link to="/login">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to login
            </Link>
          </Button>
        </div>
      </div>
    </AuthLayout>
  )
}

function InvalidResetLink() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-kaizen-bg-soft px-4 py-12">
      <section className="w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30">
            <XCircle className="size-8 text-kaizen-accent" aria-hidden="true" />
          </div>

          <h1 className="font-display text-kaizen-charcoal text-2xl font-bold tracking-tight sm:text-3xl dark:text-white">
            Invalid reset link
          </h1>

          <p className="text-kaizen-gray mt-3 text-sm leading-relaxed sm:text-base">
            This password reset link is missing or invalid. Please request a
            new one to continue.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button size="lg" className="w-full cursor-pointer" asChild>
            <Link to="/forgot-password">Request a new reset link</Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full cursor-pointer"
            asChild
          >
            <Link to="/login">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to login
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}