import { Moon, Sun ,Laptop} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "#/providers/theme-provider"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="text-kaizen-gray hover:border-kaizen-primary hover:text-kaizen-primary flex h-9.5 w-9.5 shrink-0 cursor-pointer rounded-full items-center justify-center  border border-[rgba(76,175,125,0.2)] bg-transparent transition-all hover:rotate-15 !outline-none"
          aria-label="Toggle theme"
        >
          <Sun className="size-[1.125rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-[1.125rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-[rgba(76,175,125,0.15)] bg-white/95 backdrop-blur-lg dark:border-[rgba(76,175,125,0.15)] dark:bg-[#141715]/95 min-w-[130px] rounded-xl p-1.5 shadow-lg z-9999"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="text-kaizen-gray hover:text-kaizen-primary focus:text-kaizen-primary cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:bg-[rgba(76,175,125,0.08)] dark:focus:bg-[rgba(76,175,125,0.12)]"
        >
          <Sun className="size-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="text-kaizen-gray hover:text-kaizen-primary focus:text-kaizen-primary cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:bg-[rgba(76,175,125,0.08)] dark:focus:bg-[rgba(76,175,125,0.12)]"
        >
          <Moon className="size-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="text-kaizen-gray hover:text-kaizen-primary focus:text-kaizen-primary cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:bg-[rgba(76,175,125,0.08)] dark:focus:bg-[rgba(76,175,125,0.12)]"
        >
          <Laptop />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}