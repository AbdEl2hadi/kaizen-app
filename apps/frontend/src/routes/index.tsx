import { createFileRoute } from '@tanstack/react-router'
import { OAuthPopupBridge } from '#/components/shared/popup-window'
import { LandingPage } from '#/components/landing/LandingPage'

export const Route = createFileRoute('/')({
  component: () => (
    <>
      <OAuthPopupBridge />
      <LandingPage />
    </>
  ),
})
