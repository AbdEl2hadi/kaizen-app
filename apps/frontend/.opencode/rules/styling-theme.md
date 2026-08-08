# Theme and dark mode spec
When implementing or editing theme-related features, strictly use the following references:

## 1- Provider Component (`/src/providers/theme-provider.tsx`)
```tsx
    import { createContext, useContext, useEffect, useState } from "react"
import { ScriptOnce } from "@tanstack/react-router"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

function getThemeScript(storageKey: string, defaultTheme: Theme) {
  const key = JSON.stringify(storageKey)
  const fallback = JSON.stringify(defaultTheme)

  return `(function(){try{var t=localStorage.getItem(${key});if(t!=='light'&&t!=='dark'&&t!=='system'){t=${fallback}}var d=matchMedia('(prefers-color-scheme: dark)').matches;var r=t==='system'?(d?'dark':'light'):t;var e=document.documentElement;e.classList.add(r);e.style.colorScheme=r}catch(e){}})();`
}

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "system",
  setTheme: () => {},
})

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.remove("light", "dark")

  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme

  root.classList.add(resolved)
  root.style.colorScheme = resolved
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    setThemeState(
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : defaultTheme
    )
    setMounted(true)
  }, [defaultTheme, storageKey])

  

  useEffect(() => {
    if (!mounted || theme !== "system") return

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => applyTheme("system")
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [theme, mounted])

  const setTheme = (next: Theme) => {
    localStorage.setItem(storageKey, next)

  const update = () => {
    applyTheme(next)
    setThemeState(next)
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!document.startViewTransition) {
    update()
    return
  }

  document.startViewTransition(update)
  }

  return (
    <ThemeProviderContext value={{ theme, setTheme }}>
      <ScriptOnce>{getThemeScript(storageKey, defaultTheme)}</ScriptOnce>
      {children}
    </ThemeProviderContext>
  )
}

export function useTheme() {
  const context = useContext(ThemeProviderContext)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
```
## 2- Wrap route layout (`/src/routes/__root.tsx`)
```tsx
...
<body>
        <ThemeProvider defaultTheme="system" storageKey="theme">
          <Outlet /> {/* or children according to __root config*/}
        </ThemeProvider>
        <Scripts />
    </body>
```
## 3- Mode toggle Component (`/src/components/mode-toggle.tsx`)
- style it according to app :
```tsx
import { Laptop, Moon, Sun } from "lucide-react"

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
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Toggle theme"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Laptop className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## 4- View Transition Styles (`/src/styles.css`)
- add this : 
```css
/*=====================================
  Transition between dark and light mode
  =====================================
*/
@view-transition {
  navigation: auto;
}

/* Root transition */
::view-transition-old,
::view-transition-new {
  animation-duration: 300ms;
  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  animation-fill-mode: both;
}

/* Old page */
::view-transition-old {
  animation-name: fade-out;
}

/* New page */
::view-transition-new {
  animation-name: fade-in;
}

/* Fade */
@keyframes fade-out {
  from {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0px);
  }

  to {
    opacity: 0;
    transform: translateY(-8px);
    filter: blur(2px);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
    filter: blur(2px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}
```
