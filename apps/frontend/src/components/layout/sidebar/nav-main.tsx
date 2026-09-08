import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { ChevronRight, Search } from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

import type { SidebarNavGroup, SidebarNavItem, SidebarNavSubItem } from './index'

const isPathActive = (url: string, pathname: string) =>
  pathname === url || pathname.startsWith(`${url}/`)

const navItemClass =
  'text-kaizen-charcoal/80 transition-all duration-200 ease-out ' +
  'hover:bg-kaizen-mint/60 hover:text-kaizen-charcoal ' +
  'data-[active=true]:bg-kaizen-primary/[0.09] data-[active=true]:font-semibold ' +
  'data-[active=true]:text-kaizen-primary-dark ' +
  'data-[active=true]:shadow-[inset_2.5px_0_0_0_var(--kaizen-primary)] ' +
  'data-[active=true]:[&>svg]:text-kaizen-primary-dark ' +
  'dark:text-white/75 dark:hover:bg-white/[0.05] dark:hover:text-white ' +
  'dark:data-[active=true]:bg-kaizen-primary/[0.12] ' +
  'dark:data-[active=true]:text-kaizen-primary-light ' +
  'dark:data-[active=true]:shadow-[inset_2.5px_0_0_0_var(--kaizen-primary-light)] ' +
  'dark:data-[active=true]:[&>svg]:text-kaizen-primary-light'

const subItemClass =
  'text-kaizen-charcoal/65 transition-all duration-200 ease-out ' +
  'hover:bg-kaizen-mint/50 hover:text-kaizen-charcoal ' +
  'data-[active=true]:bg-kaizen-primary/[0.07] data-[active=true]:font-medium ' +
  'data-[active=true]:text-kaizen-primary-dark ' +
  'data-[active=true]:[&>svg]:text-kaizen-primary-dark ' +
  'dark:text-white/55 dark:hover:bg-white/[0.04] dark:hover:text-white/90 ' +
  'dark:data-[active=true]:bg-kaizen-primary/[0.1] ' +
  'dark:data-[active=true]:text-kaizen-primary-light ' +
  'dark:data-[active=true]:[&>svg]:text-kaizen-primary-light'

function SubItemButton({
  subItem,
  activePath,
}: {
  subItem: SidebarNavSubItem
  activePath: string
}) {
  const isActive = subItem.url
    ? isPathActive(subItem.url, activePath)
    : false

  const content = (
    <>
      {subItem.icon && <subItem.icon className="size-3.5 shrink-0" />}
      <span className="truncate">{subItem.title}</span>
    </>
  )

  return subItem.url ? (
    <SidebarMenuSubButton
      asChild
      isActive={isActive}
      className={`h-8 rounded-lg pl-3 text-[0.8125rem] ${subItemClass}`}
    >
      <Link to={subItem.url} className="flex items-center gap-2">
        {content}
      </Link>
    </SidebarMenuSubButton>
  ) : (
    <SidebarMenuSubButton
      isActive={isActive}
      className={`h-8 rounded-lg pl-3 text-[0.8125rem] ${subItemClass}`}
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
    ? isPathActive(item.url, activePath)
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
      className={`h-10.5 rounded-xl px-3 ${navItemClass}`}
    >
      <Link to={item.url}>{content}</Link>
    </SidebarMenuButton>
  ) : (
    <SidebarMenuButton
      isActive={isActive}
      tooltip={item.title}
      className={`h-10.5 rounded-xl px-3 ${navItemClass}`}
    >
      {content}
    </SidebarMenuButton>
  )
}

function NavItem({
  item,
  activePath,
  forceOpen,
}: {
  item: SidebarNavItem
  activePath: string
  forceOpen: boolean
}) {
  const childActive = useMemo(
    () =>
      item.subItems?.some(
        (subItem) =>
          subItem.url && isPathActive(subItem.url, activePath)
      ) ?? false,
    [item.subItems, activePath]
  )

  const [open, setOpen] = useState(childActive)

  // Auto-open the group whenever a sub-route becomes active
  // (e.g. landing on /habit/performance after a refresh).
  useEffect(() => {
    if (childActive) setOpen(true)
  }, [childActive])

  if (!item.subItems) {
    return (
      <SidebarMenuItem>
        <NavItemButton item={item} activePath={activePath} />
      </SidebarMenuItem>
    )
  }

  const isOpen = forceOpen || open

  return (
    <Collapsible open={isOpen} onOpenChange={setOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={childActive}
            className={`h-10.5 rounded-xl px-3 ${navItemClass}`}
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
                <SubItemButton subItem={subItem} activePath={activePath} />
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function NavMain({
  groups,
}: {
  groups: readonly SidebarNavGroup[]
}) {
  const { pathname } = useLocation()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // ⌘K / Ctrl+K focuses the sidebar search.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const trimmedQuery = query.trim().toLowerCase()

  const filteredGroups = useMemo(() => {
    if (!trimmedQuery) return groups

    return groups
      .map((group) => ({
        ...group,
        items: group.items
          .map((item) => {
            if (item.title.toLowerCase().includes(trimmedQuery)) return item
            if (item.subItems) {
              const subItems = item.subItems.filter((subItem) =>
                subItem.title.toLowerCase().includes(trimmedQuery)
              )
              return subItems.length ? { ...item, subItems } : null
            }
            return null
          })
          .filter((item): item is SidebarNavItem => item !== null),
      }))
      .filter((group) => group.items.length > 0)
  }, [groups, trimmedQuery])

  return (
    <div className="flex flex-col gap-4">
      <div className="group-data-[collapsible=icon]:hidden px-3 pt-1">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <SidebarInput
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search…"
            aria-label="Search navigation"
            className="h-9 rounded-xl border-transparent bg-kaizen-mint/40 pr-9 pl-9 text-[0.8125rem] shadow-none focus-visible:border-kaizen-primary/40 dark:bg-white/4"
          />
          <kbd className="text-muted-foreground/70 pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded-md border border-border/60 bg-background px-1.5 py-0.5 font-sans text-[0.625rem] font-medium sm:block">
            ⌘K
          </kbd>
        </div>
      </div>

      {filteredGroups.map((group) => (
        <SidebarGroup key={group.label} className="px-0">
          <SidebarGroupLabel className="text-kaizen-gray-light px-3 text-[0.6875rem] font-semibold tracking-[0.08em] uppercase dark:text-white/35">
            {group.label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.title}
                  item={item}
                  activePath={pathname}
                  forceOpen={!!trimmedQuery}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}

      {filteredGroups.length === 0 && (
        <p className="text-muted-foreground px-3 text-[0.8125rem]">
          No results for “{query}”.
        </p>
      )}
    </div>
  )
}