import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireAuth } from '#/features/auth/guard'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '#/components/ui/sidebar'
import { AppSidebar } from '#/components/layout/app-sidebar'
import { ModeToggle } from '#/components/ui/mode-toggle'
import { env } from '#/lib/env'

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context }) =>
    env.VITE_APP_ENV === 'production' ? requireAuth(context.queryClient) : null,
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <SidebarProvider 
      defaultOpen={true}

    >
      <AppSidebar />
      <div className="bg-background flex min-h-svh flex-1 flex-col">
        <header className="border-sidebar-border/60 bg-background/80 flex h-14 shrink-0 items-center gap-3 border-b px-4 backdrop-blur-sm">
          <SidebarTrigger 
            
           />
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </header>
        <SidebarInset>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
