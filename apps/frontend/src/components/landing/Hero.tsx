import { useEffect, useRef } from 'react'

import { Safari } from '../ui/safari'

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      if (mq.matches) videoRef.current?.pause()
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  return (
    <>
      <section
        className="relative overflow-hidden bg-[linear-gradient(135deg,#e8f5e9_0%,#fffde7_40%,#fff0ed_70%,#f1f8e9_100%)] pt-40 pb-25 max-[480px]:pt-25 max-[480px]:pb-10 max-md:pt-30 max-md:pb-15 dark:bg-[linear-gradient(135deg,#0e1f12_0%,#1e1f12_40%,#241514_70%,#121f12_100%)]"
        aria-label="Hero"
      >
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-multiply [mask-image:radial-gradient(ellipse_80%_80%_at_50%_35%,black_50%,transparent_100%)] dark:opacity-25 dark:mix-blend-normal"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src="/assets/Ink_diffusing_in_water.mp4" type="video/mp4" />
        </video>

        <div className="mx-auto grid max-w-300 grid-cols-1 items-center gap-15 px-6 max-lg:text-center lg:grid-cols-2">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="bg-kaizen-primary rounded-[100px] px-3.5 py-1 text-xs font-bold tracking-[0.08em] text-white uppercase">
                Steady
              </span>
              <span className="bg-kaizen-accent rounded-[100px] px-3.5 py-1 text-xs font-bold tracking-[0.08em] text-white uppercase">
                Mindful
              </span>
              <span className="bg-kaizen-cream text-kaizen-charcoal rounded-[100px] px-3.5 py-1 text-xs font-bold tracking-[0.08em] uppercase">
                Consistent
              </span>
            </div>
            <h1 className="font-display text-kaizen-charcoal mb-5 text-[clamp(2.5rem,5vw,4rem)] leading-[1.08] font-extrabold tracking-tight">
              Small Steps.
              <br />
              <span className="text-kaizen-primary">Big Change.</span>
              <br />
              One Habit at a Time.
            </h1>
            <p className="text-kaizen-gray mb-8 max-w-120 text-lg leading-[1.6] max-lg:mx-auto dark:text-[#8a8f8d]">
              Track your habits, build lasting streaks, and celebrate every
              milestone with Kaizen — your personal growth companion.
            </p>
            <div className="flex flex-wrap gap-3 max-lg:justify-center">
              <button
                className="font-display bg-kaizen-charcoal inline-flex cursor-pointer items-center gap-2 rounded-[100px] border-none px-8 py-3.5 text-[0.9375rem] font-bold text-white transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(45,59,54,0.15)] max-[480px]:px-6 max-[480px]:py-3 max-[480px]:text-xs dark:bg-[#e8eae9] dark:text-[#141715]"
                aria-label="Get started free"
              >
                Get Started Free
                <svg
                  className="h-4.5 w-4.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
              <button
                className="font-display text-kaizen-charcoal border-kaizen-charcoal hover:bg-kaizen-charcoal inline-flex cursor-pointer items-center gap-2 rounded-[100px] border-2 bg-transparent px-8 py-3.5 text-[0.9375rem] font-bold transition-all duration-250 hover:text-white max-[480px]:px-6 max-[480px]:py-3 max-[480px]:text-xs dark:border-[#e8eae9] dark:text-[#e8eae9] dark:hover:bg-[#e8eae9] dark:hover:text-[#141715]"
                aria-label="See how it works"
              >
                See How It Works
              </button>
            </div>
          </div>

          <div
            className="relative flex min-h-120 items-center justify-center max-lg:mt-10 max-lg:min-h-100"
            aria-hidden="true"
          >
            <Safari
              url="Kaizen-app/dashboard"
              mode="simple"
              className="w-160! shrink-0"
            />

            <img
              src="/assets/moscot-noback.png"
              alt=""
              className="absolute -right-5 -bottom-4 z-6 block h-auto w-27.5 animate-[peekBounce_3s_ease-in-out_infinite] object-cover max-md:-right-2.5 max-md:-bottom-2.5 max-md:w-19"
            />
          </div>
        </div>
      </section>

      <section
        className="border-b border-[rgba(76,175,125,0.08)] bg-white py-12 dark:border-[rgba(76,175,125,0.1)] dark:bg-[#1a1d1b]"
        aria-label="Awards and recognition"
      >
        <div className="mx-auto flex max-w-300 flex-wrap justify-center gap-12 px-6 max-md:gap-6">
          <div className="text-kaizen-gray flex items-center gap-2.5 text-[0.8125rem] font-medium max-md:text-[0.7rem]">
            <svg
              className="h-5.5 w-5.5 shrink-0"
              viewBox="0 0 22 22"
              fill="none"
            >
              <path
                d="M11 1l2.7 5.5 6.1.9-4.4 4.3 1 6.1L11 15.5l-5.4 2.8 1-6.1L2.2 7.4l6.1-.9L11 1z"
                fill="#4CAF7D"
              />
            </svg>
            Best Habit App 2024
          </div>
          <div className="text-kaizen-gray flex items-center gap-2.5 text-[0.8125rem] font-medium max-md:text-[0.7rem]">
            <svg
              className="h-5.5 w-5.5 shrink-0"
              viewBox="0 0 22 22"
              fill="none"
            >
              <path
                d="M11 1l2.7 5.5 6.1.9-4.4 4.3 1 6.1L11 15.5l-5.4 2.8 1-6.1L2.2 7.4l6.1-.9L11 1z"
                fill="#FF6F5E"
              />
            </svg>
            Editor's Choice — App Store
          </div>
          <div className="text-kaizen-gray flex items-center gap-2.5 text-[0.8125rem] font-medium max-md:text-[0.7rem]">
            <svg
              className="h-5.5 w-5.5 shrink-0"
              viewBox="0 0 22 22"
              fill="none"
            >
              <path
                d="M11 1l2.7 5.5 6.1.9-4.4 4.3 1 6.1L11 15.5l-5.4 2.8 1-6.1L2.2 7.4l6.1-.9L11 1z"
                fill="#F0E6D2"
              />
            </svg>
            Most Mindful App 2024
          </div>
        </div>
      </section>
    </>
  )
}
