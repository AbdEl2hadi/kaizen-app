-- name: CreateHabit :one
INSERT INTO habits (id, user_id, habit_name, icon, input_type, input_config, sort_order)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, habit_name, icon, input_type, input_config, sort_order, is_active;

-- name: GetHabits :many
SELECT id, habit_name, icon, input_type, input_config, sort_order, is_active FROM habits
WHERE user_id = $1
  AND is_active = $2
ORDER BY sort_order;

-- name: GetHabit :one
SELECT id, user_id, habit_name, icon, input_type, input_config, sort_order, is_active, created_at
FROM habits
WHERE id = $1 AND user_id = $2;

-- name: SetIsActiveHabit :exec
UPDATE habits SET is_active = $1
WHERE id = $2 AND user_id = $3;

-- name: UpdateHabit :one
UPDATE habits SET
    habit_name = COALESCE(sqlc.narg('habit_name'), habit_name),
    icon = COALESCE(sqlc.narg('icon'), icon),
    input_type = COALESCE(sqlc.narg('input_type'), input_type),
    input_config = COALESCE(sqlc.narg('input_config'), input_config),
    sort_order = COALESCE(sqlc.narg('sort_order'), sort_order)
WHERE id = $1 AND user_id = $2
RETURNING id, habit_name, icon, input_type, input_config, sort_order, is_active;

-- name: GetUserHabitsWithLogs :many
SELECT
    h.id            AS habit_id,
    h.habit_name,
    h.icon,
    h.input_type,
    h.input_config,
    h.sort_order,
    e.entry_date,
    e.value         AS log_value
FROM habits h
LEFT JOIN daily_habit_entries e
    ON h.id = e.habit_id
    AND e.entry_date BETWEEN $1::date AND $2::date
WHERE h.user_id = $3
  AND h.is_active = TRUE
ORDER BY h.sort_order, h.id ,  e.entry_date ASC;

-- name: GetHabitForValidation :one
SELECT input_type, input_config FROM habits
WHERE id = $1 AND user_id = $2 AND is_active = TRUE;

-- name: SetUserHabitLog :exec
WITH habit AS (
    SELECT id FROM habits
    WHERE id = $1 AND user_id = $2 AND is_active = TRUE
)
INSERT INTO daily_habit_entries (habit_id, entry_date, value)
SELECT id, $3::date, $4 FROM habit
    ON CONFLICT (habit_id, entry_date)
DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
