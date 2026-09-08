function ScallopBumps() {
  return (
    <div className="scallop-bumps" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  )
}

export function Features() {
  return (
    <>
      <section className="relative pt-25 pb-15 text-center" id="features">
        <div className="mx-auto max-w-300 px-6">
          <span className="text-kaizen-accent inline-flex items-center gap-2 rounded-[100px] bg-[#fff0ed] px-4 py-1.5 text-xs font-semibold tracking-[0.03em] uppercase dark:bg-[rgba(255,111,94,0.15)] dark:text-[#ff8f7a]">
            🌱 Your Growth Advantage
          </span>
          <h2 className="font-display text-kaizen-charcoal mt-3 text-[clamp(2rem,3.5vw,3rem)] leading-[1.15] font-bold">
            A Smarter Way to Build
            <br />
            Better Habits
          </h2>
        </div>
      </section>

      <section className="relative pb-25" id="product">
        <div className="mx-auto grid max-w-300 grid-cols-1 gap-7.5 px-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="cloud-card relative overflow-hidden rounded-[40px_16px_40px_16px/24px_40px_24px_40px] bg-white shadow-[0_8px_32px_rgba(45,59,54,0.08)] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(45,59,54,0.12)] dark:bg-[#262927] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
            <ScallopBumps />
            <div className="relative z-2 p-10 pb-9 text-center">
              <div
                className="mx-auto mb-5 flex h-15 w-15 items-center justify-center rounded-[18px]"
                style={{ background: 'var(--kaizen-mint)' }}
              >
                <svg className="h-7.5 w-7.5" viewBox="0 0 28 28" fill="none">
                  <circle
                    cx="14"
                    cy="14"
                    r="10"
                    stroke="#4CAF7D"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 14l4 4 8-8"
                    stroke="#4CAF7D"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div
                className="mx-auto mb-5 w-full max-w-50 overflow-hidden rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:brightness-[0.85]"
              >
                <img
                  src="/assets/feature-ai.png"
                  alt="AI-powered insights illustration"
                  className="block h-auto w-full"
                  loading="lazy"
                />
              </div>
              <h3 className="font-display text-kaizen-charcoal mb-2.5 text-xl font-bold">
                AI-Powered Insights
              </h3>
              <p className="text-kaizen-gray text-[0.9375rem] leading-[1.6]">
                Personalized habit recommendations based on your patterns, so
                you know exactly what to work on next.
              </p>
            </div>
          </div>

          <div className="cloud-card relative overflow-hidden rounded-[40px_16px_40px_16px/24px_40px_24px_40px] bg-white shadow-[0_8px_32px_rgba(45,59,54,0.08)] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(45,59,54,0.12)] dark:bg-[#262927] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
            <ScallopBumps />
            <div className="relative z-2 p-10 pb-9 text-center">
              <div
                className="mx-auto mb-5 flex h-15 w-15 items-center justify-center rounded-[18px]"
                style={{ background: '#FFF0ED' }}
              >
                <svg className="h-7.5 w-7.5" viewBox="0 0 28 28" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="22"
                    height="22"
                    rx="4"
                    stroke="#FF6F5E"
                    strokeWidth="2"
                  />
                  <path
                    d="M9 14l4 4 6-6"
                    stroke="#FF6F5E"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div
                className="mx-auto mb-5 w-full max-w-50 overflow-hidden rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:brightness-[0.85]"
              >
                <img
                  src="/assets/feature-tracking.png"
                  alt="All-in-one tracking illustration"
                  className="block h-auto w-full"
                  loading="lazy"
                />
              </div>
              <img
                src="/assets/mascot-reading.png"
                alt=""
                aria-hidden="true"
                className="absolute -right-3 -bottom-3 z-6 block h-auto w-21 animate-[float_6s_ease-in-out_infinite] object-cover max-md:hidden"
              />
              <h3 className="font-display text-kaizen-charcoal mb-2.5 text-xl font-bold">
                All-in-One Tracking
              </h3>
              <p className="text-kaizen-gray text-[0.9375rem] leading-[1.6]">
                Habits, goals, and progress in one beautifully simple place. No
                more juggling multiple apps.
              </p>
            </div>
          </div>

          <div className="cloud-card relative overflow-hidden rounded-[40px_16px_40px_16px/24px_40px_24px_40px] bg-white shadow-[0_8px_32px_rgba(45,59,54,0.08)] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(45,59,54,0.12)] dark:bg-[#262927] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
            <ScallopBumps />
            <div className="relative z-2 p-10 pb-9 text-center">
              <div
                className="mx-auto mb-5 flex h-15 w-15 items-center justify-center rounded-[18px]"
                style={{ background: 'var(--kaizen-pale-yellow)' }}
              >
                <svg className="h-7.5 w-7.5" viewBox="0 0 28 28" fill="none">
                  <path
                    d="M14 3l3 6 6.5 1-4.7 4.6 1.1 6.4L14 18l-5.9 3 1.1-6.4L4.5 10 11 9l3-6z"
                    fill="#FFD54F"
                  />
                </svg>
              </div>
              <div
                className="mx-auto mb-5 w-full max-w-50 overflow-hidden rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:brightness-[0.85]"
              >
                <img
                  src="/assets/feature-motivation.png"
                  alt="Motivation illustration"
                  className="block h-auto w-full"
                  loading="lazy"
                />
              </div>
              <img
                src="/assets/mascot-walking.png"
                alt=""
                aria-hidden="true"
                className="absolute -right-3 -bottom-3 z-6 block h-auto w-21 animate-[float_6s_ease-in-out_infinite] object-cover max-md:hidden"
              />
              <h3 className="font-display text-kaizen-charcoal mb-2.5 text-xl font-bold">
                Motivation that Lasts
              </h3>
              <p className="text-kaizen-gray text-[0.9375rem] leading-[1.6]">
                Streaks, achievements, and gentle reminders keep you going —
                even on days when motivation runs low.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="relative bg-[linear-gradient(180deg,var(--kaizen-bg-soft)_0%,var(--kaizen-mint-soft)_100%)] py-20 pb-25 dark:bg-[linear-gradient(180deg,#141715_0%,#1a2e1f_100%)]"
        id="pricing"
      >
        <div className="mx-auto grid max-w-300 grid-cols-1 items-center gap-15 px-6 lg:grid-cols-2">
          <div className="relative">
            <div className="cloud-card bg-kaizen-mint relative overflow-hidden rounded-[40px_16px_40px_16px/24px_40px_24px_40px] shadow-[0_8px_32px_rgba(45,59,54,0.08)] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(45,59,54,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
              <div className="scallop-bumps" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="relative z-2 p-10">
                <h3 className="font-display text-kaizen-charcoal mb-6 text-[1.625rem] leading-tight font-bold">
                  Track what matters:
                  <br />
                  streaks, consistency,
                  <br />
                  and daily wins
                </h3>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <div className="font-display text-kaizen-primary text-[1.75rem] font-extrabold">
                      12
                    </div>
                    <div className="text-kaizen-gray-light mt-0.5 text-[0.8125rem]">
                      Current Streak (days)
                    </div>
                  </div>
                  <div>
                    <div className="font-display text-kaizen-primary text-[1.75rem] font-extrabold">
                      71%
                    </div>
                    <div className="text-kaizen-gray-light mt-0.5 text-[0.8125rem]">
                      Weekly Completion
                    </div>
                  </div>
                  <div>
                    <div className="font-display text-kaizen-primary text-[1.75rem] font-extrabold">
                      45
                    </div>
                    <div className="text-kaizen-gray-light mt-0.5 text-[0.8125rem]">
                      Longest Streak (days)
                    </div>
                  </div>
                  <div>
                    <div className="font-display text-kaizen-primary text-[1.75rem] font-extrabold">
                      5
                    </div>
                    <div className="text-kaizen-gray-light mt-0.5 text-[0.8125rem]">
                      Active Goals
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <img
              src="/assets/mascot-meditating.png"
              alt=""
              aria-hidden="true"
              className="absolute -right-2 -bottom-6 z-6 block h-auto w-25 animate-[float_7s_ease-in-out_infinite] object-cover max-lg:hidden"
            />
          </div>

          <div className="relative flex justify-center max-lg:-order-1">
            <div
              className="w-115 animate-[float_7s_ease-in-out_infinite] overflow-hidden rounded-xl bg-[linear-gradient(150deg,#e8f5e9,#f1f8e9)] shadow-[0_20px_60px_rgba(45,59,54,0.1),0_0_0_1px_rgba(45,59,54,0.05)] max-md:w-full max-md:max-w-100"
              style={{ animationDelay: '-2s' }}
            >
              <div className="flex items-center gap-2 border-b border-[rgba(0,0,0,0.04)] bg-white/70 px-4 py-3 dark:bg-[rgba(255,255,255,0.1)]">
                <span className="h-3 w-3 shrink-0 rounded-full bg-[#ff5f57]"></span>
                <span className="h-3 w-3 shrink-0 rounded-full bg-[#ffbd2e]"></span>
                <span className="h-3 w-3 shrink-0 rounded-full bg-[#28c840]"></span>
                <span className="text-kaizen-gray ml-2.5 flex-1 truncate rounded-md bg-white px-3.5 py-1 text-center text-xs shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-[#333640] dark:text-[#8a8f8d]">
                  kaizen.app/progress
                </span>
              </div>
              <div className="p-5 px-6 dark:bg-[#262927]">
                <h4 className="text-kaizen-charcoal mb-4 text-center text-[0.9rem] font-bold">
                  📊 Your Progress
                </h4>
                <div className="flex justify-between border-b border-[rgba(0,0,0,0.04)] py-2.5 dark:border-[rgba(255,255,255,0.05)]">
                  <span className="text-kaizen-gray text-[0.72rem]">
                    Current Streak
                  </span>
                  <span className="text-kaizen-charcoal text-[0.8rem] font-bold dark:text-[#e8eae9]">
                    12 days 🔥
                  </span>
                </div>
                <div className="flex justify-between border-b border-[rgba(0,0,0,0.04)] py-2.5 dark:border-[rgba(255,255,255,0.05)]">
                  <span className="text-kaizen-gray text-[0.72rem]">
                    Weekly Completion
                  </span>
                  <span className="text-kaizen-charcoal text-[0.8rem] font-bold dark:text-[#e8eae9]">
                    71% ↑
                  </span>
                </div>
                <div className="flex justify-between border-b border-[rgba(0,0,0,0.04)] py-2.5 dark:border-[rgba(255,255,255,0.05)]">
                  <span className="text-kaizen-gray text-[0.72rem]">
                    Longest Streak
                  </span>
                  <span className="text-kaizen-charcoal text-[0.8rem] font-bold dark:text-[#e8eae9]">
                    45 days 🏆
                  </span>
                </div>
                <div className="flex justify-between border-b border-[rgba(0,0,0,0.04)] py-2.5 dark:border-[rgba(255,255,255,0.05)]">
                  <span className="text-kaizen-gray text-[0.72rem]">
                    Active Goals
                  </span>
                  <span className="text-kaizen-charcoal text-[0.8rem] font-bold dark:text-[#e8eae9]">
                    5 of 8
                  </span>
                </div>
                <div className="flex justify-between border-b border-[rgba(0,0,0,0.04)] py-2.5 dark:border-[rgba(255,255,255,0.05)]">
                  <span className="text-kaizen-gray text-[0.72rem]">
                    Total Check-ins
                  </span>
                  <span className="text-kaizen-charcoal text-[0.8rem] font-bold dark:text-[#e8eae9]">
                    247
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-kaizen-charcoal my-2 text-[0.7rem] font-semibold">
                    Weekly Habits
                  </p>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-kaizen-gray w-15 shrink-0 text-[0.65rem]">
                      Meditation
                    </span>
                    <div
                      className="h-3 rounded-md bg-[linear-gradient(90deg,var(--kaizen-primary-light),var(--kaizen-primary))] transition-[width_0.6s]"
                      style={{ width: '90%' }}
                    ></div>
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-kaizen-gray w-15 shrink-0 text-[0.65rem]">
                      Exercise
                    </span>
                    <div
                      className="h-3 rounded-md bg-[linear-gradient(90deg,var(--kaizen-primary-light),var(--kaizen-primary))] transition-[width_0.6s]"
                      style={{ width: '65%' }}
                    ></div>
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-kaizen-gray w-15 shrink-0 text-[0.65rem]">
                      Reading
                    </span>
                    <div
                      className="h-3 rounded-md bg-[linear-gradient(90deg,var(--kaizen-primary-light),var(--kaizen-primary))] transition-[width_0.6s]"
                      style={{ width: '45%' }}
                    ></div>
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-kaizen-gray w-15 shrink-0 text-[0.65rem]">
                      Journal
                    </span>
                    <div
                      className="h-3 rounded-md bg-[linear-gradient(90deg,var(--kaizen-primary-light),var(--kaizen-primary))] transition-[width_0.6s]"
                      style={{ width: '80%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
