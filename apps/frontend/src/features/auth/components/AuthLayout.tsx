import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { Home } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip'
import { TortoiseMascot } from './TortoiseMascot'

interface AuthLayoutProps {
  title: string
  subtitle: string
  tagline: string
  mascotPose: 'walking' | 'celebrating'
  proofCard?: ReactNode
  children: ReactNode
}

export function AuthLayout({
  title,
  subtitle,
  tagline,
  mascotPose,
  proofCard,
  children,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/"
            className="fixed top-4 left-4 z-50 flex items-center justify-center rounded-full bg-white p-2.5 shadow-md transition-colors hover:bg-gray-100 dark:bg-[#1e2023] dark:hover:bg-[#2a2d31]"
            aria-label="Home"
          >
            <Home className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </Link>
        </TooltipTrigger>
        <TooltipContent>Back to home</TooltipContent>
      </Tooltip>
      <div className="flex w-full flex-col items-center justify-center bg-white px-5 py-3 lg:w-[55%] dark:bg-[#141715]">
        <div className="flex h-full w-full max-w-105 flex-col">
          <Link to="/" className="inline-flex">
            <img
              src="/assets/kaizen-logo-noBack.png"
              alt="Kaizen"
              className="-ml-10 h-14 w-auto sm:h-24"
            />
          </Link>

          <div className="mb-1 flex justify-center lg:hidden">
            <TortoiseMascot pose={mascotPose} className="h-12 w-auto sm:h-16" />
          </div>

          <div className="flex-1">
            <h1 className="font-display text-kaizen-charcoal text-xl font-bold sm:text-2xl dark:text-white">
              {title}
            </h1>
            <p className="text-kaizen-gray text-xs sm:text-sm">{subtitle}</p>
            {children}
          </div>
        </div>
      </div>

      <div className="relative hidden w-[45%] flex-col items-center justify-center bg-linear-to-br from-[#4CAF7D] via-[#66BB8A] to-[#81C784] p-12 lg:flex">
        <div className="max-w-md text-center">
          <p className="font-display text-2xl leading-relaxed font-semibold text-white">
            {tagline}
          </p>
          <div className="mt-8 flex justify-center">
            <TortoiseMascot pose={mascotPose} className="h-48 w-auto" />
          </div>
          {proofCard && (
            <div className="absolute top-1/3 right-8 -translate-y-1/2 rotate-6">
              {proofCard}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
