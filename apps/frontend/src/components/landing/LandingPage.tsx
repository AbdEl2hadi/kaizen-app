import { Navbar } from './Navbar'
import { Hero } from './Hero'
import { Features } from './Features'
import { CTA } from './CTA'

export function LandingPage() {
  return (
    <div className="landing-page">
      <Navbar />
      <Hero />
      <Features />
      <CTA />
    </div>
  )
}
