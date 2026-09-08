import { Link } from '@tanstack/react-router'
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { AuthLayout } from './AuthLayout'
import { useForgotPassword } from '#/features/auth/hooks/useForgotPassword'

const inputClass =
  'w-full rounded-xl border border-[#e0e0e0] px-3 py-2 text-xs text-kaizen-charcoal placeholder:text-kaizen-gray-light outline-none dark:border-[#333] dark:bg-[#1a1d1b] dark:text-white sm:px-4 sm:py-2.5 sm:text-sm'

export function ForgotPasswordPage() {
  const { register, handleSubmit, errors, isLoading, error, isSent, onSubmit } =
    useForgotPassword()

  if (isSent) {
    return <ResetLinkSent />
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link"
      tagline='"Small steps lead to big changes. Recov-ering your access is just one."'
      mascotPose="walking"
      proofCard={
        <div className="rounded-2xl bg-white/90 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm dark:bg-[#1a1d1b]/90">
          <p className="text-kaizen-charcoal text-sm font-semibold">
            We'll get you back in
          </p>
          <p className="text-kaizen-gray text-xs">Check your inbox in a few minutes</p>
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
            htmlFor="forgot-password-email"
            className="text-kaizen-charcoal mb-1.5 block text-xs font-medium sm:text-sm dark:text-white"
          >
            Email address
          </label>
          <input
            id="forgot-password-email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={inputClass}
            placeholder="jane@example.com"
          />
          {errors.email && (
            <p className="mt-0.5 text-[10px] text-[#FF6F5E] sm:text-xs">
              {errors.email.message}
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
              Sending reset link...
            </>
          ) : (
            'Send reset link'
          )}
        </button>

        {error && (
          <p className="text-center text-[10px] text-[#FF6F5E] sm:text-xs">
            {error}
          </p>
        )}

        <p className="text-kaizen-gray text-center text-[10px] sm:text-xs">
          Remembered your password?{' '}
          <Link
            to="/login"
            className="font-medium text-[#4CAF7D] underline underline-offset-2 hover:text-[#3d9b6a]"
          >
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

function ResetLinkSent() {
  return (
    <AuthLayout
      title="Check your email"
      subtitle="We've sent you a password reset link"
      tagline='"Consistency over perfection — every tiny step counts."'
      mascotPose="walking"
    >
      <div className="mt-4 flex flex-col items-center rounded-2xl border border-[#e0e0e0] p-6 text-center sm:mt-6 dark:border-[#333]">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-kaizen-mint dark:bg-kaizen-mint/50">
          <MailCheck
            className="size-7 text-kaizen-primary animate-scale-in"
            aria-hidden="true"
          />
        </div>

        <p className="text-kaizen-charcoal text-sm font-medium sm:text-base dark:text-white">
          Reset link sent!
        </p>

        <p className="text-kaizen-gray mt-2 text-xs leading-relaxed sm:text-sm">
          If an account exists for that email, you&#39;ll receive a link to reset
          your password shortly. Don&#39;t forget to check your spam folder.
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