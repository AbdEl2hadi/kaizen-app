package v1

import (
	"github.com/go-chi/chi/v5"
)

func Routes(h *Handler) chi.Router {
	r := chi.NewRouter()

	// habits management
	r.Get("/", h.GetHabits)
	r.Post("/", h.CreateHabit)
	r.Delete("/{habitID}", h.DeleteHabit)
	r.Patch("/{habitID}/restore", h.RestoreHabit)
	r.Patch("/{habitID}", h.UpdateHabit)

	// habit logs
	r.Get("/logs/week", h.GetWeekLogs)
	r.Get("/logs/month", h.GetMonthLogs)

	// Update a single day's habit log
	r.Put("/{habitID}/logs/{date}", h.SetHabitLog)

	return r
}
