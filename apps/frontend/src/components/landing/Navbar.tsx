import { ModeToggle } from "@/components/ui/mode-toggle"

export function Navbar() {
  return (
    <nav
      className="fixed top-0 right-0 left-0 z-1000"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto mt-4 flex h-18 max-w-300 items-center gap-10 rounded-full bg-white/80 px-6 shadow-[0_8px_32px_rgba(45,59,54,0.1)] backdrop-blur-xl max-md:mx-4 dark:bg-[rgba(20,23,21,0.85)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <a
          href="#"
          className="font-display text-kaizen-charcoal flex shrink-0 items-center gap-2 text-2xl font-extrabold"
          aria-label="Kaizen home"
        >
          <img
            src="/assets/kaizen-logo-noBack.png"
            alt="Kaizen"
            className="block h-18 w-auto"
          />
        </a>
        <div className="ml-auto flex items-center gap-6">
          <a
            href="#features"
            className="text-kaizen-gray hover:text-kaizen-primary hidden text-[0.9375rem] font-medium transition-colors md:block"
          >
            Features
          </a>
          <a
            href="#product"
            className="text-kaizen-gray hover:text-kaizen-primary hidden text-[0.9375rem] font-medium transition-colors md:block"
          >
            Product
          </a>
          <a
            href="#pricing"
            className="text-kaizen-gray hover:text-kaizen-primary hidden text-[0.9375rem] font-medium transition-colors md:block"
          >
            Pricing
          </a>
          <button className="bg-kaizen-primary hover:bg-kaizen-primary-dark rounded-[100px] px-6 py-2.5 text-sm font-semibold text-[#ffffff] transition-colors max-[480px]:px-4 max-[480px]:py-2 max-[480px]:text-xs">
            Explore Features →
          </button>
          <ModeToggle />
        </div>
        <button
          className="flex cursor-pointer flex-col gap-1.25 border-none bg-none p-2 md:hidden"
          aria-label="Toggle menu"
        >
          <span className="bg-kaizen-charcoal block h-[2.5px] w-7 rounded-sm transition-[0.3s]"></span>
          <span className="bg-kaizen-charcoal block h-[2.5px] w-7 rounded-sm transition-[0.3s]"></span>
          <span className="bg-kaizen-charcoal block h-[2.5px] w-7 rounded-sm transition-[0.3s]"></span>
        </button>
      </div>
    </nav>
  )
}
