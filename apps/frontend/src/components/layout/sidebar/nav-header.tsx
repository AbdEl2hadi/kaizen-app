import { Link } from '@tanstack/react-router'

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function NavHeader() {
  return (
    <SidebarHeader className="border-sidebar-border/60 relative border-b px-3 pt-3 pb-2.75 group-data-[collapsible=icon]:border-b-0 group-data-[collapsible=icon]:px-0">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            asChild
            className="h-8 rounded-xl px-2 transition-all duration-200 ease-out hover:bg-transparent active:bg-transparent group-data-[collapsible=icon]:mx-auto"
          >
            <Link to="/dashboard" className="gap-2.5">
              <span className="bg-kaizen-mint/70 flex size-8 shrink-0 items-center justify-center rounded-xl shadow-[inset_0_0_0_1px_rgba(76,175,125,0.15)] dark:bg-kaizen-primary/15">
                <img
                  src="/assets/kaizen-logo-noBack.png"
                  alt=""
                  className="size-6 object-contain filter-[brightness(0)_saturate(100%)_invert(58%)_sepia(35%)_saturate(800%)_hue-rotate(95deg)]"
                />
              </span>
              <span className="font-display truncate text-[0.9375rem] font-bold tracking-tight text-kaizen-charcoal group-data-[collapsible=icon]:hidden dark:text-white/90">
                Kaizen
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}