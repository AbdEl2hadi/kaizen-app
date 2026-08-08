import { Link } from '@tanstack/react-router'

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function NavHeader() {
  return (
    <SidebarHeader className="bg-gradient-to-b from-kaizen-mint/30 to-transparent px-3 group-data-[collapsible=icon]:px-0 pb-1.5 pt-3 dark:from-kaizen-primary/[0.04]">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            asChild
            className="h-10 rounded-xl px-1.5 transition-all duration-200 ease-out hover:bg-kaizen-mint/50 group-data-[collapsible=icon]:mx-auto dark:hover:bg-white/[0.04]"
          >
            <Link to="/dashboard" className="gap-2">
              <img
                src="/kaizen-logo-noBack.png"
                alt=""
                className="size-16 shrink-0 object-contain [filter:brightness(0)_saturate(100%)_invert(58%)_sepia(35%)_saturate(800%)_hue-rotate(95deg)] group-data-[collapsible=icon]:size-8"
              />
              <span className="font-display truncate text-base font-bold tracking-tight text-kaizen-charcoal group-data-[collapsible=icon]:hidden dark:text-white/90">
                Kaizen
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}