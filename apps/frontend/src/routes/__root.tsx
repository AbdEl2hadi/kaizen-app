import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { Toaster } from 'sonner'
import { TooltipProvider } from "@/components/ui/tooltip"

import { TanStackQueryDevtools } from '../integrations/tanstack-query/devtools'
import { ThemeProvider } from '#/providers/theme-provider'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Kaizen – Small Steps. Big Change.',
      },
      {
        name: 'description',
        content:
          'Track your habits, build lasting streaks, and celebrate every milestone with Kaizen — your personal growth companion.',
      },
      {
        property: 'og:title',
        content: 'Kaizen – Small Steps. Big Change.',
      },
      {
        property: 'og:description',
        content:
          'Track your habits, build lasting streaks, and celebrate every milestone with Kaizen.',
      },
      {
        property: 'og:image',
        content: '/assets/og-kaizen.png',
      },
      {
        property: 'og:type',
        content: 'website',
      },
    ],
    links: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/assets/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: 'any',
        href: '/assets/kaizen-icon.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/assets/apple-touch-icon.png',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
  
})

function RootDocument({ children }: { children: React.ReactNode }) {
  console.log("[client] : rendering")
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans wrap-anywhere antialiased selection:bg-[rgba(79,184,178,0.24)]">
        <ThemeProvider defaultTheme="system" storageKey="theme">
          <TooltipProvider>
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
            }}
          />
          </TooltipProvider>
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
