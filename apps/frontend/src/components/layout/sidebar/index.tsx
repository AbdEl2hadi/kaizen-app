import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  ListTodo,
  Repeat,
  Settings,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { LinkProps, RegisteredRouter } from '@tanstack/react-router'


export type RoutePaths = LinkProps<RegisteredRouter['routeTree']>['to']


export type SidebarNavSubItem = {
  title: string
  icon?: LucideIcon
  url?: RoutePaths
}

export type SidebarNavItem = {
  title: string
  icon?: LucideIcon
  url?: RoutePaths
  subItems?: SidebarNavSubItem[]
}

export const navItems = [
  { title: 'Dashboard', url:'/dashboard' , icon: LayoutDashboard },
  {
    title: 'Habit',
    icon: Repeat,
    subItems: [
      { title: 'Daily Log', url : '/habit/daily-log' ,icon: ClipboardList  },
      { title: 'Goals & Challenges', url : '/habit/goals-chanlenges' ,  icon: Target },
      { title: 'TO-DOs', url: "/habit/to-dos", icon: ListTodo },
      { title: 'Performance',url: "/habit/performance" , icon: TrendingUp },
    ],
  },
  { title: 'Calendar', url: "/calendar" ,  icon: CalendarDays },
  { title: 'Achievements', url:"/achievements" ,icon: Trophy },
  { title: 'Settings', url :"/settings" , icon: Settings },
] as const satisfies readonly SidebarNavItem[]