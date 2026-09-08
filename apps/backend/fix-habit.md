# Fix Habit Logs — Status

Code review findings for the `internal/modules/habits` module (handler, service, model, router) with current status.

## Status Summary

| # | Issue | Status |
|---|-------|--------|
| 1 | `SetHabitLog` never sends a response or checks errors | ✅ Fixed |
| 2 | `SetHabitLog` can never persist a log (UPDATE-only, no INSERT anywhere) | ✅ Fixed (upsert in `habit.sql`) |
| 3 | `SetHabitLog` has no ownership check (IDOR) | ✅ Fixed |
| 4 | `GetLogs` grouping breaks on duplicate `sort_order` | ✅ Fixed |
| 5 | `GetMonthLogs` off-by-one (next month day-1 leaks in) | ✅ Fixed |
| 6 | `GetMonthLogs` mixes timezones | ✅ Fixed (accepts `?date=` like week) |
| 7 | Wrong log messages in logs handlers | ✅ Fixed |
| 8 | No value validation in `SetHabitLog` | ✅ Fixed (shape + ranges + formats) |
| 9 | Bad log values return 500 instead of 400 | ✅ Fixed (`utils.AppError`) |
| 10 | No `oneof` validation on `InputType` | ✅ Fixed |
| 11 | `UpdateHabit` compares errors by string, not `errors.Is` | ✅ Fixed (sentinel `ErrNoFieldsToUpdate`) |
| 12 | Mixed response shapes (snake_case rows vs camelCase DTOs) | ✅ Fixed (camelCase `HabitDTO` everywhere) |
| 13 | `InputConfig` never validated per input type | ✅ Fixed |
| 14 | No tests in the module | ⏭ Skipped (not requested) |
| 15 | `fix-habit.md` stale (upsert was already applied) | ✅ Fixed |
| S1 | Week logs use hidden `±3` centered window | ❌ **Open — decision needed** |
| S2 | `input` shape mismatch backend vs frontend | ❌ **Open — decision needed** |
| S3 | Request fields snake_case vs response camelCase | ✅ Fixed (camelCase everywhere) |
| S4 | `archived` query param required | ❌ **Open — decision needed** |
| S5 | `DELETE` returns 200 + body, not 204 | ❌ **Open — decision needed** |
| S6 | Dead `db`/`config` fields in habits `Service` | ❌ **Open — decision needed** |

---

## ✅ Fixed

### 1. `SetHabitLog` never sends a response or checks errors

**Location:** `internal/modules/habits/handler.go`

Handler checks `err` from `SetLog` and sends a proper response: `404` for `pgx.ErrNoRows`, `400` for `*utils.AppError`, `500` for other errors, `200` on success.

### 2. `SetHabitLog` can never persist a log

**Location:** `internal/queries/habit.sql:78-93`, generated `internal/Repository/habit.sql.go:237-263`

Upsert confirmed applied:

```sql
-- name: SetUserHabitLog :exec
WITH habit AS (
    SELECT id FROM habits
    WHERE id = $1 AND user_id = $2 AND is_active = TRUE
)
INSERT INTO daily_habit_entries (habit_id, entry_date, value)
SELECT id, $3::date, $4 FROM habit
    ON CONFLICT (habit_id, entry_date)
DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
```

### 3. `SetHabitLog` has no ownership check (IDOR)

**Location:** `service.go:170-175`, `habit.sql:12-15`

Service resolves the habit with `GetHabit(id, userID)` first — `pgx.ErrNoRows` → 404 if not owned; SQL joins on `user_id` as defense in depth.

### 4. `GetLogs` grouping breaks on duplicate `sort_order`

**Location:** `internal/queries/habit.sql`

`ORDER BY h.sort_order, h.id, e.entry_date ASC` — rows per habit are contiguous; grouping no longer creates duplicate `HabitDTO` blocks.

### 5. `GetMonthLogs` off-by-one

**Location:** `handler.go`

`endMonth := startMonth.AddDate(0, 1, -1)` — last day of the month; inclusive `BETWEEN` no longer leaks day-1 of next month.

### 6. `GetMonthLogs` timezone

**Location:** `handler.go:202-230`

`GetMonthLogs` now accepts `?date=` from the client (same contract as `GetWeekLogs`) and computes the month window from it — server is stateless, no timezone mixing.

### 7. Wrong messages in logs handlers

**Location:** `handler.go`

Both log endpoints now log `"could not fetch habits logs"` and respond with `"habit logs fetched successfully"`.

### 8. Value validation in `SetHabitLog`

**Location:** `service.go:170-250`

Validates value shape **and** ranges/formats against `habit.InputType`:

- `number` → JSON number; rejected if it exceeds `input_config.target` (when target > 0)
- `percent` → JSON number within 0–100
- `checkbox` → boolean
- `select` / `multiselect` → known option(s) from `input_config.options`
- `date` → `YYYY-MM-DD` parseable string
- `url` → http(s) URL with host
- `text` / `files` → string, max `maxTextValueLen` (1000) characters

### 9. Bad log values return 500 instead of 400

**Location:** `internal/utils/errors.go`, `handler.go:37-46`

New `utils.AppError{Status, Message}`; the service returns it for validation failures and `sendAppError` maps it via `errors.As` → `400` with the message. `pgx.ErrNoRows` still → `404`, everything else → `500`.

### 10. No `oneof` validation on `InputType`

**Location:** `model.go`

`HabitPostRequest.InputType` and `HabitPatchRequest.InputType` now validate `required,oneof=checkbox text number select multiselect percent date files url`.

### 11. `UpdateHabit` compares errors by string

**Location:** `model.go:9`, `handler.go`

`var ErrNoFieldsToUpdate = errors.New("no fields to update")` sentinel; handler uses `errors.Is`.

### 12. Mixed response shapes

**Location:** `handler.go`, `service.go`

All habit endpoints return camelCase `HabitDTO` (`id`, `name`, `icon`, `input{type,config}`, `sortOrder`, `isActive`, `logs?`). Mapping lives in `service.toHabitDTO`; raw `Repository.*Row` structs no longer leak into responses. Matches the user module convention and the frontend's `Habit` type shape.

**Contract note:** `input_config` now uses `options` (plural) — aligned with the frontend's `HabitInput = { type, options?, target? }`. Backend `InputConfigType` = `{ options?: string[], target?: number }`.

### 13. `InputConfig` never validated per input type

**Location:** `service.go:40-69` (`validateInputConfig`)

Checked on create and on update (merged with existing config when only one of type/config is patched):

- `select` / `multiselect` → non-empty, non-duplicate, non-blank options
- `number` → `target >= 0`
- `percent` → `target` within 0–100
- `checkbox` / `text` / `date` / `files` / `url` → config must be empty

Invalid config → `400` via `utils.AppError`.

### 15. `fix-habit.md` stale

Upsert was already applied; document rewritten to reflect actual state.

---

## ⏭ Skipped

### 14. No tests

No `*_test.go` anywhere in the repo. Not done by request. High-value targets when tests are wanted:

- `SetLog` value validation (table-driven: each input type × valid/invalid value)
- `GetLogs` grouping (duplicate `sort_order`, empty logs, NULL log values)
- `validateInputConfig` per input type

---

## Notes / Minor

- `NewValidator()` wrapper removed — `validator.New()` inlined in `NewHandler`.
- In `GetLogs` (`service.go`), `NULL` log values are skipped — only real logs appear in `logs`.
- `GetWeekLogs` uses a `±3` day window centered on the requested date (inclusive, 7 days total) — fine as long as that is the intended semantics.
- `DeleteHabit` returns `200` + the archived habit body — fine, or use `204`.
- Extra `GetHabit` round-trip in `UpdateHabit` only when `input_type`/`input_config` is patched (needed to validate the merged config).

---

## 🏗 Structural Issues (API contract — not yet fixed)

The Go layering (router → handler → service → sqlc Repository) is idiomatic and consistent with the auth/user modules. The weaknesses below are API-contract decisions, not code structure. **None are fixed yet — decisions required.**

### S1. `GET /habits/logs/week` uses a hidden `±3` window

**Location:** `handler.go` (`GetWeekLogs`), documented in `api/paths/habits.yaml` (`week-logs`)

The client must compute the *center* date of the week (`date − 3` to `date + 3`). That semantics exists only in the server code — it is an implicit contract nobody else knows.

**Solutions (pick one):**
- **Recommended:** client sends *any* day within the week; the server derives Mon–Sun via `date.Weekday()` offset — natural "give me the week of X" contract.
- Alternative: replace week/month with a single `GET /habits/logs?from=&to=` and let the client pick ranges (most flexible; week/month become client-side presets).
- Keep as-is and document the `±3` center semantics prominently (already half-done in the OpenAPI description).

### S2. `input` shape mismatch between backend and frontend

**Location:** `model.go` (`HabitInputDTO`), `apps/frontend/src/features/habit/types.ts` (`HabitInput`)

Backend returns `input: { type, config: <raw JSON> }`; the frontend `HabitInput` type is flat `{ type, options?, target? }`. The frontend is **not wired to the API yet**, so now is the only cheap moment to pick one contract.

**Solutions (pick one):**
- **Recommended:** keep the backend `{ type, config }` contract and update the frontend type — `config` stays generic for future input types (e.g. `files`) without schema churn.
- Alternative: flatten the response to `{ type, options?, target? }` (fully typed OpenAPI schema, but every new input type means a contract change).

### S3. Request/response field naming is split

**Location:** `model.go` (`HabitPostRequest`/`HabitPatchRequest`), OpenAPI schemas

Requests use `habit_name`, `input_type`, `sort_order` (snake_case, DB-ish); responses use `name`, `input`, `sortOrder` (camelCase). Minor, but one convention reads better.

**Solution (applied):** request fields renamed to camelCase — `name`, `icon`, `inputType`, `inputConfig`, `sortOrder` — in the models and the OpenAPI `CreateHabitRequest`/`UpdateHabitRequest` schemas + examples. Breaking change; do it before the frontend wires up.

### S4. `archived` query param is required

**Location:** `handler.go` (`GetHabits`), `api/paths/habits.yaml`

`GET /habits` rejects requests without `?archived=`. Explicit but unfriendly — every client must always pass it.

**Solutions (pick one):**
- **Recommended:** default to `false` when absent (active habits), keep `?archived=true` for archive views.
- Keep required (defensible: explicit intent, no accidental archive queries).

### S5. `DELETE /habits/{habitID}` returns `200` + body

**Location:** `handler.go` (`DeleteHabit`), `api/paths/habits.yaml`

Convention for deletes is `204 No Content`.

**Solution:** respond `204` with no body (the archived habit's `isActive: false` is already visible via `GET /habits?archived=true`).

### S6. Dead fields in `Service`

**Location:** `service.go:16-20`

`Service.db` and `Service.config` are never used in the habits module (auth uses them; habits only needs `query`).

**Solution:** drop both fields and change `NewService(db, cfg)` → `NewService(db)` — or keep for codebase-wide symmetry; either is acceptable, just be deliberate.