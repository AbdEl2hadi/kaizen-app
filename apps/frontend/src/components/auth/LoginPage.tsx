import { Link } from '@tanstack/react-router'
import { Chrome, Eye, EyeOff, Facebook, Loader2 } from 'lucide-react'
import { Checkbox } from '#/components/ui/checkbox'
import { PopupWindow } from '#/components/shared/popup-window'
import { AuthLayout } from './AuthLayout'
import { useLogin } from '#/features/auth/hooks/useLogin'
import { useOAuthPopup } from '#/features/auth/hooks/useOAuthPopup'

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

  const {
    googleUrl,
    facebookUrl,
    expectedOrigin,
    handleOAuthMessage,
    handleOAuthClose,
  } = useOAuthPopup()

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
              {...register('identity')}
              className={inputClass}
              placeholder="jane@example.com or username"
            />
          </div>
          {errors.identity && (
            <p className="mt-0.5 text-[10px] text-[#FF6F5E] sm:text-xs">
              {errors.identity.message}
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
