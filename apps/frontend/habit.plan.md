# Habit Feature Port Plan

Source: `/home/kaiden/Desktop/habit` (standalone React demo app, JSX + in-memory state)
Target: `apps/frontend` (TanStack Start, strict TS, TanStack Store, tanstack charts, shadcn/ui, kaizen tokens)

## Why "as-is" is wrong (gaps found)

| Source (habit app) | Target (kaizen-app) | Action |
|---|---|---|
| JSX, untyped | Strict TS, zod validation | Full retype |
| `useReducer` global state | TanStack Store (AGENTS.md) | Rewrite as store |
| recharts | tanstack charts (AGENTS.md) | `bun add @tanstack/react-charts` |
| Custom tokens (`bg-bg`, `accent-soft`, `mint`, `coral`, `panel`, `edge`, `track`, `ok/warn/bad`, `btn`, `faint/meta/micro`) | None of these exist here | Remap to kaizen/shadcn tokens |
| Hand-rolled Checkbox, SlidePanel, inputs | shadcn `checkbox`, `sheet`, `input`, `button` (installed) | Replace primitives |
| `Header` with 3 tabs | Sidebar nav already wired for all 4 habit routes | Drop Header entirely |
| Custom `useTheme` | Existing `ThemeProvider`/`useTheme` | Use existing |
| Seed data: archived habits dated 2025 (log only covers current year → lifetime shows 0%) | — | Shift archived defs into current year so demo stays meaningful |

## Architecture (per `.opencode/rules/architecture.md`)

```
src/features/habit/
├── types.ts                      # Habit, Goal, DailyEntry, Priority, Status
├── schema/                       # zod: addHabit, addGoal forms
├── store/habit-store.ts          # TanStack store: state + actions (toggleDay, setNote, add/archive/restore habit, add/toggle/delete goal, view/range/year)
├── lib/date.ts                   # typed port: todayKey, lastDays, monthKeys, shortLabel, addDays
├── lib/stats.ts                  # typed port: dayPct, dayChecked, statusFor, lifetimeCompletion, goalBuckets
├── data/seed.ts                  # typed port (mulberry32 + defs), archived habits shifted to current year
├── constants.ts                  # EMOJIS, priorities, chart theme hex (from CSS vars, not hardcoded)
├── hooks/use-habit-store.ts      # selector hooks (avoid unnecessary renders)
└── components/
    ├── today-summary.tsx         # "Today" card: pct, progress bar, status
    ├── log-table.tsx             # keeps scroll-to-today, today highlight, notes input
    ├── log-chart.tsx             # rewritten with @tanstack/react-charts line chart
    ├── goals-panel.tsx           # full Today/Week/Later/Done buckets (from Goals.jsx)
    ├── to-dos-panel.tsx          # NEW: filtered actionable view (undone goals) w/ add/toggle
    ├── performance-grid.tsx      # heatmap MonthCard + year switcher (from Archive.jsx)
    ├── archive-habits.tsx        # archived cards + restore
    ├── manage-panel.tsx          # inside shadcn Sheet (focus trap/Escape/backdrop built-in)
    └── ui/
        ├── progress-bar.tsx      # or add shadcn progress (bunx shadcn@latest add progress)
        └── segmented-toggle.tsx  # small custom (no shadcn equiv)
```

Routes (stubs already exist under `src/routes/_auth/habit/`):
- `daily-log.tsx` → today-summary + log-table/log-chart + manage-panel
- `goals-chanlenges.tsx` → goals-panel
- `to-dos.tsx` → to-dos-panel
- `performance.tsx` → performance-grid + archive-habits

Token mapping: `panel`→`card`, `panel-2`/`surface`→`secondary`/`muted`, `edge`→`border`, `btn`→`primary`, `mint`→`kaizen-mint`, `accent-dark`→`kaizen-primary-dark`, `ok`→`primary`, `warn`→amber, `bad`→`destructive`, `faint`/`meta`/`micro`→text-xs + `muted-foreground`, `display/stat/headline`→`font-display`, `shadow-card`→`shadow-sm`, `animate-*`→`tw-animate-css` utilities.

## Steps

1. `bun add @tanstack/react-charts`
2. Scaffold feature: types → lib → seed → store → hooks
3. Build shared UI primitives with kaizen tokens
4. Build daily-log stack (table, chart, manage panel in Sheet)
5. Build goals + to-dos panels
6. Build performance heatmap + archive
7. Wire 4 route components
8. Verify: `bun run generate-routes`, `bun run lint --fix`, `bun test`, `bun run build`

## Status: DONE

All steps completed and verified (`tsc`, `eslint`, `vite build`, SSR smoke test of all 4 routes).
Note: `bun test` finds no test files — the repo has no tests yet (pre-existing state).
