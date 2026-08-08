import { useState } from 'react'

export function CTA() {
  return (
    <>
      {/* FAQ */}
      <section
        className="faq-section relative overflow-hidden bg-white py-25 dark:bg-[#141715]"
        aria-label="Frequently asked questions"
      >
        <svg
          className="pointer-events-none absolute opacity-15"
          style={{ width: 200, height: 160, top: 40, left: 0 }}
          viewBox="0 0 200 160"
          fill="none"
        >
          <path
            d="M40,140 C10,140 0,110 0,90 C0,60 20,35 50,30 C55,10 80,0 100,0 C130,0 150,20 150,45 C180,45 200,70 200,100 C200,130 180,140 150,140 Z"
            fill="#4CAF7D"
          />
        </svg>
        <svg
          className="pointer-events-none absolute opacity-12"
          style={{ width: 180, height: 140, bottom: 40, right: 0 }}
          viewBox="0 0 200 160"
          fill="none"
        >
          <path
            d="M40,140 C10,140 0,110 0,90 C0,60 20,35 50,30 C55,10 80,0 100,0 C130,0 150,20 150,45 C180,45 200,70 200,100 C200,130 180,140 150,140 Z"
            fill="#FF6F5E"
          />
        </svg>

        <div className="mx-auto max-w-190 px-6">
          <FAQs />
        </div>
      </section>

      {/* CTA Banner */}
      <section
        className="cta-banner relative overflow-hidden py-25 text-center"
        style={{
          background:
            'linear-gradient(135deg,#FF6F5E 0%,#FF8F7A 40%,#FF6F5E 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 8s ease-in-out infinite',
        }}
        aria-label="Call to action"
      >
        <div className="relative z-2 mx-auto max-w-300 px-6">
          <div
            className="mb-10 flex justify-center gap-5 max-[480px]:flex-wrap max-md:gap-3"
            style={{ perspective: 1200 }}
            aria-hidden="true"
          >
            <div
              className="w-50 overflow-hidden rounded-[10px] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-transform duration-400 max-[480px]:w-32.5 max-md:w-37.5 dark:bg-[#262927]"
              style={{
                transform: 'rotate(-6deg) translateY(12px)',
                animation:
                  'float 6s ease-in-out infinite, pulseGlow 3s ease-in-out infinite',
                animationDelay: '0s',
              }}
            >
              <CTABrowser>
                <div className="mini-title text-kaizen-charcoal mb-1.5 text-center text-[0.65rem] font-bold dark:text-[#E8EAE9]">
                  📋 Dashboard
                </div>
                <div className="mb-0.5 flex items-center gap-1.5 rounded-md bg-white/50 px-1.5 py-1 text-[0.55rem]">
                  <span>☀️ Morning routine</span>
                </div>
                <div className="mb-0.5 flex items-center gap-1.5 rounded-md bg-white/50 px-1.5 py-1 text-[0.55rem]">
                  <span>🏃 30 min walk</span>
                </div>
                <div className="mb-0.5 flex items-center gap-1.5 rounded-md bg-white/50 px-1.5 py-1 text-[0.55rem]">
                  <span>📖 Read 20 pages</span>
                </div>
                <div
                  className="mt-1.5 h-1 rounded-sm bg-[#A5D6A7]"
                  style={{ width: '80%' }}
                ></div>
              </CTABrowser>
            </div>
            <div
              className="w-50 overflow-hidden rounded-[10px] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-transform duration-400 max-[480px]:w-32.5 max-md:w-37.5 dark:bg-[#262927]"
              style={{
                transform: 'translateY(-6px)',
                animation:
                  'float 6s ease-in-out infinite, pulseGlow 3s ease-in-out infinite',
                animationDelay: '-2s',
              }}
            >
              <CTABrowser>
                <div className="mini-title text-kaizen-charcoal mb-1.5 text-center text-[0.65rem] font-bold dark:text-[#E8EAE9]">
                  📅 Calendar
                </div>
                <div className="mt-1 grid grid-cols-7 gap-0.5">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d,i) => (
                    <span
                      key={`${d}-${i}`}
                      className="text-kaizen-gray text-center text-[5px]"
                    >
                      {d}
                    </span>
                  ))}
                  <span className="bg-kaizen-primary h-2 w-2 rounded-full"></span>
                  <span className="bg-kaizen-primary h-2 w-2 rounded-full"></span>
                  <span className="bg-kaizen-primary h-2 w-2 rounded-full"></span>
                  <span className="bg-kaizen-primary h-2 w-2 rounded-full"></span>
                  <span className="bg-kaizen-primary h-2 w-2 rounded-full"></span>
                  <span className="h-2 w-2 rounded-full bg-[#C8E6C9]"></span>
                  <span className="h-2 w-2 rounded-full bg-[#C8E6C9]"></span>
                </div>
              </CTABrowser>
            </div>
            <div
              className="w-50 overflow-hidden rounded-[10px] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-transform duration-400 max-[480px]:w-32.5 max-md:w-37.5 dark:bg-[#262927]"
              style={{
                transform: 'rotate(6deg) translateY(12px)',
                animation:
                  'float 6s ease-in-out infinite, pulseGlow 3s ease-in-out infinite',
                animationDelay: '-4s',
              }}
            >
              <CTABrowser>
                <div className="mini-title text-kaizen-charcoal mb-1.5 text-center text-[0.65rem] font-bold dark:text-[#E8EAE9]">
                  🏆 Achievements
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF9C4] text-sm">
                    🔥
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F5E9] text-sm">
                    ⭐
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF0ED] text-sm">
                    🏅
                  </div>
                </div>
              </CTABrowser>
            </div>
          </div>

          <h2 className="font-display mb-3 text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] font-extrabold text-white">
            Your Growth. Your Journey.
          </h2>
          <p className="mb-8 text-[1.125rem] text-[rgba(255,255,255,0.85)]">
            Track progress, build habits, and celebrate every small win.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div
              className="text-kaizen-primary flex cursor-pointer items-center gap-2.5 rounded-[14px] bg-white px-7 py-3 text-sm font-semibold shadow-lg transition-transform duration-250 hover:-translate-y-1"
              aria-label="Start free trial"
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 2v20M2 12h20" />
              </svg>
              <span>
                <small className="block text-[0.6rem] font-normal opacity-70">
                  Start for free
                </small>
                Start Free Trial
              </span>
            </div>
            <div
              className="flex cursor-pointer items-center gap-2.5 rounded-[14px] border-2 border-white px-7 py-3 text-sm font-semibold text-white transition-transform duration-250 hover:-translate-y-1 hover:bg-white/10"
              aria-label="Launch web app"
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
              <span>
                <small className="block text-[0.6rem] font-normal opacity-70">
                  Open in browser
                </small>
                Launch Web App
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="bg-kaizen-charcoal pt-16 pb-0 text-[rgba(255,255,255,0.7)] dark:bg-[#0D0F0E]"
        role="contentinfo"
      >
        <div className="mx-auto grid max-w-300 grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10 px-6 pb-12 max-[480px]:grid-cols-1 max-lg:grid-cols-[1fr_1fr_1fr] max-md:grid-cols-2">
          <div className="max-[480px]:col-span-1 max-md:col-span-2">
            <div className="font-display mb-2 flex items-center gap-2 text-xl font-extrabold text-white">
              <img
                src="/kaizen-logo-noBack.png"
                alt="Kaizen"
                className="block h-19 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <p className="max-w-65 text-sm leading-[1.6]">
              Small steps. Big change. One habit at a time. Build the life you
              want with Kaizen.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="#"
                className="flex h-9.5 w-9.5 items-center justify-center rounded-full border border-[rgba(255,255,255,0.15)] transition-all duration-250 hover:border-[#6DC99A] hover:bg-[rgba(76,175,125,0.15)]"
                aria-label="Twitter"
              >
                <svg
                  className="h-4 w-4 text-[rgba(255,255,255,0.6)]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                className="flex h-9.5 w-9.5 items-center justify-center rounded-full border border-[rgba(255,255,255,0.15)] transition-all duration-250 hover:border-[#6DC99A] hover:bg-[rgba(76,175,125,0.15)]"
                aria-label="Instagram"
              >
                <svg
                  className="h-4 w-4 text-[rgba(255,255,255,0.6)]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="#"
                className="flex h-9.5 w-9.5 items-center justify-center rounded-full border border-[rgba(255,255,255,0.15)] transition-all duration-250 hover:border-[#6DC99A] hover:bg-[rgba(76,175,125,0.15)]"
                aria-label="LinkedIn"
              >
                <svg
                  className="h-4 w-4 text-[rgba(255,255,255,0.6)]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="#"
                className="flex h-9.5 w-9.5 items-center justify-center rounded-full border border-[rgba(255,255,255,0.15)] transition-all duration-250 hover:border-[#6DC99A] hover:bg-[rgba(76,175,125,0.15)]"
                aria-label="GitHub"
              >
                <svg
                  className="h-4 w-4 text-[rgba(255,255,255,0.6)]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
            </div>
          </div>
          <FooterCol
            title="Quick Links"
            links={['Home', 'Features', 'Pricing', 'FAQ']}
          />
          <FooterCol
            title="Support"
            links={['Help Center', 'Contact Us', 'Community', 'Status']}
          />
          <FooterCol
            title="Resources"
            links={['Blog', 'Guides', 'Research', 'API']}
          />
          <FooterCol
            title="Company"
            links={['About', 'Careers', 'Press', 'Privacy']}
          />
        </div>
        <div className="mx-auto flex max-w-300 flex-wrap items-center justify-between gap-3 border-t border-[rgba(255,255,255,0.08)] px-6 pt-6 pb-6 text-sm">
          <span>&copy; 2026 Kaizen. All rights reserved.</span>
          <div className="flex gap-5">
            <a
              href="#"
              className="transition-colors duration-200 hover:text-[#6DC99A]"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="transition-colors duration-200 hover:text-[#6DC99A]"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="transition-colors duration-200 hover:text-[#6DC99A]"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}

function CTABrowser({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex items-center gap-2 border-b border-[rgba(0,0,0,0.04)] bg-[#F1F3F4] px-3 py-2 dark:border-[rgba(255,255,255,0.05)] dark:bg-[#1E2023]">
        <span className="h-2 w-2 shrink-0 rounded-full bg-[#FF5F57]"></span>
        <span className="h-2 w-2 shrink-0 rounded-full bg-[#FFBD2E]"></span>
        <span className="h-2 w-2 shrink-0 rounded-full bg-[#28C840]"></span>
        <span className="text-kaizen-gray ml-1.5 flex-1 truncate rounded-md bg-white px-2 py-0.75 text-center text-[0.55rem] shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-[#333640] dark:text-[#8A8F8D]">
          kaizen.app
        </span>
      </div>
      <div className="p-3 dark:bg-[#262927]">{children}</div>
    </>
  )
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="mb-4 text-[0.8125rem] font-bold tracking-wider text-white uppercase">
        {title}
      </h4>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link}>
            <a
              href="#"
              className="text-sm transition-colors duration-200 hover:text-[#6DC99A]"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FAQs() {
  return (
    <>
      <div className="mb-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-[100px] bg-[#E8F5E9] px-4 py-1.5 text-xs font-semibold tracking-[0.03em] text-[#3D9B6A] uppercase dark:bg-[rgba(76,175,125,0.15)] dark:text-[#6DC99A]">
          💬 FAQ
        </span>
        <h2 className="font-display text-kaizen-charcoal mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-bold">
          Answers to what our
          <br />
          community asks most
        </h2>
      </div>
      <div className="faq-list">
        <FAQItem
          question="What if I miss a day?"
          answer="Don't worry — Kaizen was built for real humans, not perfect ones. Your streak will pause, not reset. You can pick up right where you left off without losing your long-term progress data or insights."
        />
        <FAQItem
          question="Is Kaizen free?"
          answer="Yes! Kaizen is free to use with unlimited habit tracking, streaks, and basic insights. Our premium plan unlocks AI-powered recommendations, detailed analytics, and custom goal templates starting at $4.99/month."
        />
        <FAQItem
          question="Can I sync across devices?"
          answer="Absolutely. Kaizen syncs seamlessly across all your devices via the web app. Your data is encrypted end-to-end and updated in real time so you never miss a beat — just log in from any browser."
        />
        <FAQItem
          question='What does "Kaizen" mean?'
          answer='Kaizen (改善) is a Japanese philosophy meaning "continuous improvement." It&apos;s the practice of making small, incremental changes that compound into remarkable transformations over time — exactly how lasting habits are built.'
        />
      </div>
    </>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={`faq-item rounded-lg border-b border-[rgba(76,175,125,0.12)] px-2 py-5 transition-[background_0.2s] hover:bg-[rgba(76,175,125,0.03)] dark:hover:bg-[rgba(76,175,125,0.04)] ${open ? 'open' : ''}`}
    >
      <div
        className="font-display text-kaizen-charcoal hover:text-kaizen-primary flex cursor-pointer items-center justify-between gap-4 text-[1.0625rem] font-semibold transition-colors duration-200 select-none dark:text-[#E8EAE9]"
        tabIndex={0}
        role="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen(!open)
          }
        }}
      >
        {question}
        <svg
          className={`chevron text-kaizen-primary h-6 w-6 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      <div
        className={`faq-answer text-kaizen-gray overflow-hidden text-[0.9375rem] leading-[1.7] transition-all duration-400 dark:text-[#8A8F8D] ${open ? 'max-h-75 pt-3.5 opacity-100' : 'max-h-0 pt-0 opacity-0'}`}
      >
        {answer}
      </div>
    </div>
  )
}
