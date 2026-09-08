import { useEffect, useState } from "react"
import { Link, useNavigate, useRouter } from "@tanstack/react-router"
import { toast } from "sonner"
import {
  Mail,
  CheckCircle2,
  XCircle,
  Loader2,
  LogOut,
  RefreshCw,
  ArrowLeft,
} from "lucide-react"

import { Button } from "#/components/ui/button"
import { useAuth } from "#/features/auth/server/auth.server"
import { useVerifyEmailMutation } from "#/features/auth/server/verify-email.server"
import { useResendVerificationEmailMutation } from "#/features/auth/server/resend-verify-email.server"
import { useLogoutMutation } from "#/features/auth/server/logout.server"

type VerifyEmailPageProps = {
  token?: string
  email?: string
}

export function VerifyEmailPage({ token, email }: VerifyEmailPageProps) {
  if (token) {
    return <VerifyWithToken token={token} />
  }

  return <VerificationPending email={email} />
}

function VerificationPending({ email: propEmail }: { email?: string }) {
  const router = useRouter()
  const { data: userData } = useAuth()
  const resendMutation = useResendVerificationEmailMutation()
  const logoutMutation = useLogoutMutation()
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const email = propEmail ?? userData?.data?.email

  function handleResend() {
    if (!email) {
      toast.error("Unable to retrieve your email. Please try logging in again.")
      return
    }

    resendMutation.mutate({ data: { email } }, {
      onSuccess: (data) => {
        if (data.success) {
          toast.success("Verification email sent!")
          setCountdown(60)
        } else {
          toast.error(data.message ?? "Failed to send verification email.")
        }
      },
      onError: () => {
        toast.error("Something went wrong. Please try again.")
      },
    })
  }

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate({ to: "/login" })
      },
    })
    router.navigate({ to : "/login"})
  }

  const isResending = resendMutation.isPending
  const isLoggingOut = logoutMutation.isPending
  const isCountingDown = countdown > 0

  return (
    <main className="flex min-h-screen items-center justify-center bg-kaizen-bg-soft px-4 py-12">
      <section className="w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-kaizen-mint dark:bg-kaizen-mint/50">
            <Mail className="size-8 text-kaizen-primary animate-mail-bounce" aria-hidden="true" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-kaizen-charcoal sm:text-3xl font-display">
            Verify your email
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-kaizen-gray sm:text-base">
            We&#39;ve sent a verification link to your email address. Click the link in the email to activate your account.
          </p>

          {email && (
            <p className="mt-4 text-sm text-kaizen-charcoal/60">
              Signed in as <span className="font-medium text-kaizen-charcoal">{email}</span>
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full cursor-pointer"
            onClick={handleResend}
            disabled={isResending || isCountingDown}
            aria-label={isCountingDown ? `Resend in ${countdown} seconds` : "Resend verification email"}
          >
            {isResending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Sending...
              </>
            ) : isCountingDown ? (
              <>
                <RefreshCw className="size-4" aria-hidden="true" />
                Resend in {countdown}s
              </>
            ) : (
              <>
                <RefreshCw className="size-4" aria-hidden="true" />
                Resend Email
              </>
            )}
          </Button>

          {isCountingDown && (
            <p className="text-center text-xs text-kaizen-gray-light -mt-2">
              You can request another email in {countdown}s
            </p>
          )}

          <Button
            variant="outline"
            size="lg"
            className="w-full cursor-pointer"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="Log out"
          >
            {isLoggingOut ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="size-4" aria-hidden="true" />
            )}
            Logout
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-kaizen-gray-light">
          Didn&#39;t receive the email? Check your spam folder.
        </p>
      </section>
    </main>
  )
}

function VerifyWithToken({ token }: { token: string }) {
  const verifyMutation = useVerifyEmailMutation()

  useEffect(() => {
    verifyMutation.mutate({ data: { token } })
  }, [token])

  if (verifyMutation.isPending) {
    return <VerifyingLoader />
  }

  if (verifyMutation.data?.success) {
    return <VerificationSuccess />
  }

  if (verifyMutation.data) {
    return <VerificationError message={verifyMutation.data.message} />
  }

  return null
}

function VerifyingLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-kaizen-bg-soft px-4">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <Loader2 className="size-10 animate-spin text-kaizen-primary" aria-hidden="true" />
        <p className="text-sm text-kaizen-gray">Verifying your email...</p>
      </div>
    </main>
  )
}

function VerificationSuccess() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate({ to: "/dashboard" })
    }, 2000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <main className="flex min-h-screen items-center justify-center bg-kaizen-bg-soft px-4">
      <section className="flex flex-col items-center text-center animate-scale-in">
        <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-kaizen-mint dark:bg-kaizen-mint/50">
          <CheckCircle2 className="size-8 text-kaizen-primary" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-kaizen-charcoal sm:text-3xl font-display">
          Email verified!
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-kaizen-gray sm:text-base">
          Your account has been successfully verified.
        </p>

        <p className="mt-8 text-sm text-kaizen-gray-light animate-pulse">
          Redirecting...
        </p>
      </section>
    </main>
  )
}

function VerificationError({ message }: { message?: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-kaizen-bg-soft px-4 py-12">
      <section className="w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30">
            <XCircle className="size-8 text-kaizen-accent" aria-hidden="true" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-kaizen-charcoal sm:text-3xl font-display">
            Verification link is invalid
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-kaizen-gray sm:text-base">
            {message ?? "This verification link may have expired or already been used. Request a new one to continue."}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            variant="default"
            size="lg"
            className="w-full cursor-pointer"
            asChild
          >
            <Link to="/verify-email">
              <RefreshCw className="size-4" aria-hidden="true" />
              Resend Verification Email
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full cursor-pointer"
            asChild
          >
            <Link to="/login">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to Login
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
