import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from '#/components/ui/sidebar'

import { navGroups } from './sidebar'
import { NavHeader } from './sidebar/nav-header'
import { NavMain } from './sidebar/nav-main'
import { NavUser } from './sidebar/nav-user'

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-sidebar-border/60">
      <NavHeader />

      <SidebarContent className="px-2 pt-3 pb-2">
        <NavMain groups={navGroups} />
      </SidebarContent>

      <SidebarFooter>
        <div className="border-sidebar-border/60 border-t pt-2 pb-3">
          <NavUser />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}