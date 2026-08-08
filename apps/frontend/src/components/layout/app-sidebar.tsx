import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from '#/components/ui/sidebar'

import { navItems } from './sidebar'
import { NavHeader } from './sidebar/nav-header'
import { NavMain } from './sidebar/nav-main'
import { NavUser } from './sidebar/nav-user'

export function AppSidebar() {
  return ( 
    <Sidebar collapsible="icon" variant='sidebar'  className="border-sidebar-border/60">
      <NavHeader />

      <SidebarContent className="px-2 pt-2">
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarFooter>
        <div className="pb-3 pt-1">
          <NavUser />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}