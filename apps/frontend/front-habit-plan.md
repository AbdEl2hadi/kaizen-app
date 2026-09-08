# Plan: Server-backed Daily Log with Optimistic Updates

**Scope:** `src/features/habit` daily-log page only (`daily-log-page.tsx`, `log-table.tsx`, `log-chart.tsx`, `today-summary.tsx`, `habit-cell-input.tsx`).
**Out of scope (follow-ups):** seed deletion, archived habits, goals/to-dos, performance page, notes persistence on backend.

## Goal

Today the daily-log page reads `habits` + `log` from `habit-store.ts`, which is seeded with fake PRNG demo data (`data/seed.ts`) and never talks to the backend. This plan makes the daily-log page fully server-backed:

- Data (`habits`, `log`) lives in the TanStack Query cache — server is source of truth.
- Editing a cell updates the UI instantly (optimistic) and fires the background request to `PUT /habits/{habitID}/logs/{date}`.
- On failure: roll back to the pre-edit cache value + show an error toast with retry.
- Text-like inputs (text/number/url/date) are debounced so typing "12" → "123" sends one request.
- The store keeps only UI state (`view`, `range`, `chartType`, `manageOpen`, …). It is NOT deleted in this phase because other pages still read `habits`/`log`/`goals` from it.

## Backend contract (already exists — verify only)

All under `/v1`, wrapped in `ApiResponse<T>` (`{ success, data, message }`):

| Need | Endpoint | Notes |
|---|---|---|
| Habits + logs for range | `GET /habits/logs/week?date=YYYY-MM-DD` | Returns ALL active habits with embedded `logs: [{date, value}]` — even habits with zero logs in range (service.go `GetLogs`). |
| Same, month | `GET /habits/logs/month?date=YYYY-MM-DD` | Same shape. |
| Set one day | `PUT /habits/{habitID}/logs/{date}` body `{ "value": <json> }` | Idempotent upsert; validates value against the habit's input type. |

Mapping `range` (store) → endpoint: `7` → `logs/week`, `30` → `logs/month`, anchor date = `todayKey()`.

**Gap:** `HabitDTO` has no `createdAt` (frontend `Habit` requires it). Add `createdAt` to the Go DTO in a follow-up; until then default locally to `todayKey()` (daily-log page doesn't display it).

## Phase 1 — API layer + query hooks

**New file `src/features/habit/server/habits.server.ts`** (follow the auth convention: `createServerFn` + `apiServer` + `sessionMiddleware`, see `features/auth/server/auth.server.ts`):

- `getHabitLogsFn = createServerFn({ method: "GET" })` → calls `/habits/logs/week|month?date=` based on `range` + `date` args.
- `setHabitLogFn = createServerFn({ method: "PUT" })` → `/habits/{habitID}/logs/{date}` with `{ value }`.
- `habitLogsQueryOptions(range, date)` — `queryKey: ["habit", "logs", range, date]`, `staleTime` ~30s.
- `toHabitLog(habits: HabitDTO[]): { habits: Habit[]; log: Log }` — normalize:
  - `Habit`: `id, name, icon, input { type, options, target }` (parse `input.config`), `createdAt: todayKey()` (temp).
  - `Log` entry: `values[habitId] = serverValueToFrontend(value, input.type)`, `checked[habitId] = valueIsDone(input, value)` (reuse `lib/inputs.ts`).
  - `serverValueToFrontend`: `number/percent` → `String(n)`; `bool` → `String(bool)`; `array` → `string[]`; else string.
- Empty range dates: only include dates actually in `[start, end]` of the query.

**New file `src/features/habit/hooks/use-habit-data.ts`:**

- `useHabits()` → from `useQuery(habitLogsQueryOptions(range, today))` — selector on `data.habits`.
- `useLog()` → selector on `data.log`.
- `useSetLog()` → the optimistic mutation (Phase 2).

**Edit consumers** (swap import from `use-habit-store` to `use-habit-data`, keep the same hook names so diffs stay small):
- `hooks/use-log-table.ts` (lines 8, 12)
- `hooks/use-log-chart.ts` (line 9 — keeps `useChartType`/`useHabitRange` from store)
- `components/daily-log/today-summary.tsx` (line 3)

`habit-store.ts` stays untouched this phase (other pages still use it).

## Phase 2 — Optimistic set-log mutation

In `use-habit-data.ts`, `useSetLog()`:

```ts
useMutation({
  mutationFn: ({ habitId, date, value }) => setHabitLogFn({ habitId, date, value }),
  onMutate: async ({ habitId, date, value }) => {
    await queryClient.cancelQueries({ queryKey: ["habit", "logs"] })
    const prev = queryClient.getQueryData<HabitLogData>(currentKey)
    queryClient.setQueryData(currentKey, (old) => applyValue(old, habitId, date, value))
    return { prev }
  },
  onError: (_err, vars, ctx) => {
    queryClient.setQueryData(currentKey, ctx.prev)          // rollback
    toast("Couldn't save — tap to retry", { retry: () => mutate(vars) })
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ["habit", "logs"] }),
})
```

- `applyValue` mirrors the current `habitActions.setHabitValue` logic (`store/habit-store.ts:75-93`): update `values`, recompute `checked` via `valueIsDone` (habit's `input` comes from the query data).
- Rollback is to the **pre-edit cache snapshot**, not to a naive reset — covers rapid consecutive edits.
- `onSettled` invalidates both week+month keys (mutating in one range affects the other).
- Serialization concern: the backend upsert is idempotent, and the mutation runs per-call; debounce (Phase 3) prevents overlapping calls for the same cell.

## Phase 3 — Debounce text-like cells

In `habit-cell-input.tsx`, split inputs into two groups:

- **Instant mutate** (no debounce): `checkbox` (toggle), `select`, `multiselect`, `percent` (discrete picks) → call `useSetLog().mutate(...)` directly.
- **Debounced** (typing): `text`, `number`, `url`, `date`, `files` → new local wrapper component `DebouncedLogInput`:
  - Holds `draft` in `useState`, syncs from `value` prop when it changes externally (after refetch/rollback).
  - On change: update the cache **immediately** via `queryClient.setQueryData` (same `applyValue` as `onMutate`) so the grid feels instant, then schedule `mutate({ ... })` after ~400 ms (`useRef` timeout, reset per keystroke).
  - Flush on `onBlur` + `onUnmount` (send pending latest value immediately).
  - Keep a `mountedRef` so the flush-on-unmount doesn't call `setState` after teardown.

Result: typing "12" → "123" fires exactly one request with "123"; the UI shows each keystroke immediately.

## Phase 4 — Notes column (decision: keep client-side)

`SetHabitLog` only persists `value`; there is no note endpoint. Options:

1. **(Chosen, minimal)** Notes stay client-only: keep `setNote` + store `log` untouched, and in `use-log-table.ts` merge `note: storeEntry?.note ?? ""` into each row. Notes become device-local until a backend endpoint lands.
2. Disable the notes column (worse UX, less work).
3. Add a backend notes endpoint (follow-up; not this phase).

Do NOT remove `setNote` from the store in this phase.

## Phase 5 — Loading / error / empty states

- `daily-log-page.tsx`: while the logs query is `isPending` → skeleton grid (or spinner) in place of `LogTable`/`LogChart`; on `isError` → error panel with "Retry" (`refetch`). Only render the page content after `isSuccess` (or keep previous data + `isFetching` indicator for range switches).
- `TodaySummary` renders from query data automatically once hooked up; guard `total === 0` with an empty-state message ("No habits yet").

## Verification

1. `bun run build` (or the app's typecheck) — no type errors.
2. Manual: with backend + DB running, log in → daily-log page shows **real** DB habits/logs, not seed data.
3. Toggle a checkbox → instant UI change, one network request, reload keeps it.
4. Type in a number cell → grid updates per keystroke, exactly one request after ~400 ms idle, blur flushes.
5. Kill the backend, edit a cell → UI rolls back to previous value + error toast; restart backend, retry works.
6. Switch Week ↔ Month → correct endpoint, cached, no flicker (`isFetching` only).

## Follow-ups (not this phase)

- Delete `data/seed.ts` + `habits`/`log`/`goals`/`archivedHabits` from the store after performance/goals/to-dos pages are migrated (they currently depend on the seed).
- Backend: `createdAt` on `HabitDTO`; notes endpoint; year-range endpoint (`?year=` or `start/end`) for the performance page.