import { Link } from '@tanstack/react-router'
import { Chrome, Eye, EyeOff, Facebook, Loader2 } from 'lucide-react'
import { Controller } from 'react-hook-form'
import { Checkbox } from '#/components/ui/checkbox'
import { DatePicker } from '#/components/ui/date-picker'
import { PopupWindow } from '#/components/shared/popup-window'
import { AuthLayout } from './AuthLayout'
import { useSignUp } from '#/features/auth/hooks/useSignUp'
import { useOAuthPopup } from '#/features/auth/hooks/useOAuthPopup'

function parseLocalDate(value: string) {
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

const inputClass =
  'w-full rounded-xl border border-[#e0e0e0] px-3 py-2 pr-8 text-xs text-kaizen-charcoal placeholder:text-kaizen-gray-light outline-none dark:border-[#333] dark:bg-[#1a1d1b] dark:text-white sm:px-4 sm:py-2.5 sm:pr-10 sm:text-sm'

export function SignUpPage() {
  const {
    register,
    handleSubmit,
    control,
    errors,
    isLoading,
    error,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    agreeTerms,
    setAgreeTerms,
    onSubmit,
    handleConfirmBlur,
  } = useSignUp()

  const {
    googleUrl,
    facebookUrl,
    expectedOrigin,
    handleOAuthMessage,
    handleOAuthClose,
  } = useOAuthPopup()

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your kaizen journey today"
      tagline='"Small steps lead to big changes. Start your journey today."'
      mascotPose="celebrating"
      proofCard={
        <div className="rounded-2xl bg-white/90 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm dark:bg-[#1a1d1b]/90">
          <p className="text-kaizen-charcoal text-sm font-semibold">
            Join 10,000+ users
          </p>
          <p className="text-kaizen-gray text-xs">on their kaizen journey</p>
        </div>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-2 space-y-2 sm:mt-3 sm:space-y-3"
        noValidate
      >
        <div>
          <label
            htmlFor="signup-name"
            className="text-kaizen-charcoal mb-0.5 block text-[10px] font-medium sm:mb-1 sm:text-xs dark:text-white"
          >
            Full name
          </label>
          <input
            id="signup-name"
            type="text"
            {...register('fullName')}
            className={inputClass}
            placeholder="Jane Doe"
          />
          {errors.fullName && (
            <p className="mt-0.5 text-[10px] text-[#FF6F5E] sm:text-xs">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="signup-username"
            className="text-kaizen-charcoal mb-0.5 block text-[10px] font-medium sm:mb-1 sm:text-xs dark:text-white"
          >
            Username
          </label>
          <input
            id="signup-username"
            type="text"
            {...register('username')}
            className={inputClass}
            placeholder="janedoe"
          />
          {errors.username && (
            <p className="mt-0.5 text-[10px] text-[#FF6F5E] sm:text-xs">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="text-kaizen-charcoal mb-0.5 block text-[10px] font-medium sm:mb-1 sm:text-xs dark:text-white"
          >
            Email address
          </label>
          <input
            id="signup-email"
            type="email"
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

        <div>
          <label
            className="text-kaizen-charcoal mb-0.5 block text-[10px] font-medium sm:mb-1 sm:text-xs dark:text-white"
          >
            Date of birth
          </label>
          <Controller
            control={control}
            name="dateOfBirth"
            render={({ field }) => (
              <DatePicker
                value={field.value ? parseLocalDate(field.value) : undefined}
                onChange={(date) => field.onChange(date ? formatLocalDate(date) : "")}
                placeholder="Select your date of birth"
              />
            )}
          />
          {errors.dateOfBirth && (
            <p className="mt-0.5 text-[10px] text-[#FF6F5E] sm:text-xs">
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="text-kaizen-charcoal mb-0.5 block text-[10px] font-medium sm:mb-1 sm:text-xs dark:text-white"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
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
            htmlFor="signup-confirm"
            className="text-kaizen-charcoal mb-0.5 block text-[10px] font-medium sm:mb-1 sm:text-xs dark:text-white"
          >
            Confirm password
          </label>
          <div className="relative">
            <input
              id="signup-confirm"
              type={showConfirmPassword ? 'text' : 'password'}
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
          {error && (
            <p className="mt-0.5 text-[10px] text-[#FF6F5E] sm:text-xs">
              {error}
            </p>
          )}
        </div>

        <label className="flex items-start gap-2">
          <Checkbox
            checked={agreeTerms}
            onCheckedChange={(v) => setAgreeTerms(v === true)}
            className="mt-0.5 border-[#e0e0e0] focus-visible:ring-[#4CAF7D]/50 data-[state=checked]:border-[#4CAF7D] data-[state=checked]:bg-[#4CAF7D] data-[state=checked]:text-black dark:border-[#333] dark:data-[state=checked]:text-white"
          />
          <span className="text-kaizen-gray text-[10px] sm:text-xs">
            I agree to the{' '}
            <a
              href="#"
              className="text-[#4CAF7D] underline underline-offset-2 hover:text-[#3d9b6a]"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="#"
              className="text-[#4CAF7D] underline underline-offset-2 hover:text-[#3d9b6a]"
            >
              Privacy Policy
            </a>
          </span>
        </label>

        <button
          type="submit"
          disabled={isLoading || !agreeTerms}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#4CAF7D] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:bg-[#3d9b6a] disabled:cursor-not-allowed disabled:opacity-50 sm:py-2.5 sm:text-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating your account...
            </>
          ) : (
            'Create account'
          )}
        </button>

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
          <PopupWindow
            url={googleUrl}
            title="Sign in with Google"
            expectedOrigin={expectedOrigin}
            onMessage={handleOAuthMessage}
            onClose={handleOAuthClose}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={open}
                className="text-kaizen-charcoal flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#e0e0e0] px-2 py-2 text-[10px] font-medium transition-colors hover:bg-[#f8faf5] sm:px-4 sm:py-2.5 sm:text-sm dark:border-[#333] dark:text-white dark:hover:bg-[#1a1d1b]"
              >
                <Chrome className="h-4 w-4 sm:h-5 sm:w-5" />
                Continue with Google
              </button>
            )}
          </PopupWindow>
          <PopupWindow
            url={facebookUrl}
            title="Sign in with Facebook"
            expectedOrigin={expectedOrigin}
            onMessage={handleOAuthMessage}
            onClose={handleOAuthClose}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={open}
                className="text-kaizen-charcoal flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#e0e0e0] px-2 py-2 text-[10px] font-medium transition-colors hover:bg-[#f8faf5] sm:px-4 sm:py-2.5 sm:text-sm dark:border-[#333] dark:text-white dark:hover:bg-[#1a1d1b]"
              >
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
                Continue with Facebook
              </button>
            )}
          </PopupWindow>
        </div>

        <p className="text-kaizen-gray text-center text-[10px] sm:text-xs">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-[#4CAF7D]! underline! underline-offset-2 hover:text-[#3d9b6a]"
          >
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
