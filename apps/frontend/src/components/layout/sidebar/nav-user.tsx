import { useCallback } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Bell, ChevronsUpDown, LogOut, Sparkles } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAuth } from '#/features/auth/server/auth.server'
import { useLogoutMutation } from '#/features/auth/server/logout.server'
import type { User } from '#/features/auth/types'

function getInitials(fullName: string) {
  return fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function UserMenuSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex h-14 items-center gap-3 px-2">
          <Skeleton className="size-10 rounded-xl" />
          <div className="grid flex-1 gap-1.5 group-data-[collapsible=icon]:hidden">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

const DEFAULT_USER: User = {
  id: '',
  username: 'guest',
  phoneNumber: '',
  fullName: 'Guest User',
  email: 'guest@kaizen.app',
  emailVerified: false,
  bio: '',
  image: '',
  createdAt: '',
  updatedAt: '',
  dateOfBirth: '',
  timezone: '',
}

export function NavUser() {
  const router = useRouter()
  const { data, isPending, error } = useAuth()
  const logoutMutation = useLogoutMutation()

  const user = data?.success && data.data ? data.data : DEFAULT_USER

  if (error) {
    console.error('[client] : ', error)
  }

  const handleLogout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync(undefined)
    } finally {
      router.navigate({ to: '/login' })
    }
  }, [logoutMutation, router])

  if (isPending) {
    return <UserMenuSkeleton />
  }

  const initials = getInitials(user.fullName)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-kaizen-mint/60 data-[state=open]:text-kaizen-charcoal h-14 rounded-xl px-2 transition-all duration-200 ease-out dark:data-[state=open]:bg-white/[0.04] dark:data-[state=open]:text-white"
            >
              <Avatar className="ring-kaizen-primary/10 size-10 rounded-xl ring-2 dark:ring-white/10">
                <AvatarImage src={user.image || undefined} alt={user.fullName} />
                <AvatarFallback className="bg-kaizen-mint text-kaizen-primary-dark dark:bg-kaizen-primary/20 dark:text-kaizen-primary-light rounded-xl text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="text-kaizen-charcoal truncate font-semibold dark:text-white/90">
                  {user.fullName}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="text-muted-foreground ml-auto size-4 transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="border-border/60 min-w-64 rounded-2xl border p-2 shadow-[0_24px_60px_rgba(20,40,22,0.12)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.4)]"
            side="top"
            align="start"
            sideOffset={12}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 rounded-xl bg-kaizen-mint/40 px-3 py-2.5 dark:bg-white/[0.03]">
                <Avatar className="size-10 rounded-xl">
                  <AvatarImage src={user.image || undefined} alt={user.fullName} />
                  <AvatarFallback className="bg-kaizen-mint text-kaizen-primary-dark dark:bg-kaizen-primary/20 dark:text-kaizen-primary-light rounded-xl text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="text-kaizen-charcoal truncate font-semibold dark:text-white/90">
                    {user.fullName}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50 my-2" />
            <DropdownMenuGroup className="space-y-0.5">
              <DropdownMenuItem className="rounded-xl py-2.5 text-[0.8125rem]">
                <Bell className="size-4" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl py-2.5 text-[0.8125rem]">
                <Sparkles className="size-4 text-kaizen-primary" />
                <span>Upgrade to Pro</span>
                <span className="ml-auto rounded-full bg-kaizen-primary/10 px-2 py-0.5 text-[0.625rem] font-semibold text-kaizen-primary-dark dark:text-kaizen-primary-light">
                  New
                </span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-border/50 my-2" />
            <DropdownMenuItem
              disabled={logoutMutation.isPending}
              onClick={handleLogout}
              className="rounded-xl py-2.5 text-[0.8125rem] text-destructive focus:text-destructive"
            >
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}