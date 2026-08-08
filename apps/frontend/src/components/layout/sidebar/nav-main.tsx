import { Link, useLocation } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

import type { SidebarNavItem, SidebarNavSubItem } from './index'

const navItemClass =
  'text-kaizen-charcoal/80 hover:bg-kaizen-mint/70 hover:text-kaizen-charcoal ' +
  'data-[active=true]:bg-kaizen-primary/[0.08] data-[active=true]:font-medium ' +
  'data-[active=true]:text-kaizen-primary-dark ' +
  'data-[active=true]:shadow-[inset_3px_0_0_0_var(--kaizen-primary)] ' +
  'data-[active=true]:hover:bg-kaizen-primary/[0.10] data-[active=true]:hover:text-kaizen-primary-dark ' +
  'dark:text-white/75 dark:hover:bg-white/[0.04] dark:hover:text-white ' +
  'dark:data-[active=true]:text-kaizen-primary-light ' +
  'dark:data-[active=true]:bg-kaizen-primary/[0.10] ' +
  'dark:data-[active=true]:shadow-[inset_3px_0_0_0_var(--kaizen-primary-light)]'

const subItemClass =
  'text-kaizen-charcoal/65 hover:bg-kaizen-mint/50 hover:text-kaizen-charcoal ' +
  'dark:text-white/55 dark:hover:bg-white/[0.03] dark:hover:text-white/90 ' +
  'data-[active=true]:bg-kaizen-primary/[0.06] data-[active=true]:font-medium ' +
  'data-[active=true]:text-kaizen-primary-dark ' +
  'dark:data-[active=true]:text-kaizen-primary-light dark:data-[active=true]:bg-kaizen-primary/[0.08]'

function SubItemButton({ subItem }: { subItem: SidebarNavSubItem }) {
  const content = (
    <>
      {subItem.icon && <subItem.icon className="size-3.5 shrink-0" />}
      <span className="truncate">{subItem.title}</span>
    </>
  )

  return subItem.url ? (
    <SidebarMenuSubButton
      asChild
      className={`h-8 rounded-lg pl-3 text-[0.8125rem] transition-all duration-200 ease-out ${subItemClass}`}
    >
      <Link to={subItem.url} className="flex items-center gap-2">
        {content}
      </Link>
    </SidebarMenuSubButton>
  ) : (
    <SidebarMenuSubButton
      className={`h-8 rounded-lg pl-3 text-[0.8125rem] transition-all duration-200 ease-out ${subItemClass}`}
    >
      {content}
    </SidebarMenuSubButton>
  )
}

function NavItemButton({
  item,
  activePath,
}: {
  item: SidebarNavItem
  activePath: string
}) {
  const isActive = item.url
    ? activePath === item.url || activePath.startsWith(`${item.url}/`)
    : false

  const content = (
    <>
      {item.icon && <item.icon className="size-4.5 shrink-0" />}
      <span className="group-data-[collapsible=icon]:hidden truncate">
        {item.title}
      </span>
    </>
  )

  return item.url ? (
    <SidebarMenuButton
      asChild
      isActive={isActive}
      tooltip={item.title}
      className={`h-10.5 rounded-xl px-3 transition-all duration-200 ease-out ${navItemClass}`}
    >
      <Link to={item.url}>{content}</Link>
    </SidebarMenuButton>
  ) : (
    <SidebarMenuButton
      isActive={isActive}
      tooltip={item.title}
      className={`h-10.5 rounded-xl px-3 transition-all duration-200 ease-out ${navItemClass}`}
    >
      {content}
    </SidebarMenuButton>
  )
}

function NavItem({
  item,
  activePath,
}: {
  item: SidebarNavItem
  activePath: string
}) {
  if (!item.subItems) {
    return (
      <SidebarMenuItem>
        <NavItemButton item={item} activePath={activePath} />
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible asChild defaultOpen className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            className={`h-[42px] rounded-xl px-3 transition-all duration-200 ease-out ${navItemClass}`}
          >
            {item.icon && <item.icon className="size-4.5 shrink-0" />}
            <span className="group-data-[collapsible=icon]:hidden truncate">
              {item.title}
            </span>
            <ChevronRight className="text-kaizen-gray-light ml-auto size-3.5 transition-transform duration-300 ease-out group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-90 dark:text-white/40" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden transition-all duration-300 ease-out data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
          <SidebarMenuSub className="mx-2 mt-1 gap-0.5 border-l border-kaizen-mint dark:border-white/6">
            {item.subItems.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SubItemButton subItem={subItem} />
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function NavMain({ items }: { items: readonly SidebarNavItem[] }) {
  const { pathname } = useLocation()

  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map((item) => (
            <NavItem key={item.title} item={item} activePath={pathname} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}