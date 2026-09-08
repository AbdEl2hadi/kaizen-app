package v1

import (
	"context"
	"errors"
	"log"
	"net/http"
	"strconv"
	"time"

	"uuid"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/middleware"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils/apperrors"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils/httpx"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils/validation"
	"github.com/go-chi/chi/v5"
	"github.com/go-playground/validator/v10"
	"github.com/jackc/pgx/v5"
)

type Handler struct {
	service  *Service
	validate *validator.Validate
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service:  service,
		validate: validator.New(),
	}
}

func sendAppError(w http.ResponseWriter, err error) bool {
	if appErr, ok := errors.AsType[*apperrors.AppError](err); ok {
		log.Printf("%s: %v", appErr.Message, err)
		httpx.SendError[any](w, appErr.Status, nil, appErr.Message, "")
		return true
	}
	return false
}

func (h *Handler) CreateHabit(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	payload, err := validation.PayloadValidation[HabitPostRequest](w, r, h.validate)
	if err != nil {
		return
	}

	userID, err := middleware.UserIDFromContext(r.Context())

	if err != nil {
		log.Printf("could not parse user id from context %v", err)
		httpx.SendError[any](w, http.StatusUnauthorized, nil, "unauthorized", "")
		return
	}

	habit, err := h.service.CreateHabit(ctx, userID, payload)
	if err != nil {
		if sendAppError(w, err) {
			return
		}
		log.Printf("could not create habit: %v", err)
		httpx.SendError[any](w, http.StatusInternalServerError, nil, "Internal Server Error", "")
		return
	}

	httpx.SendSuccess[HabitDTO](w, http.StatusCreated, habit, "habit created successfully")
}

func (h *Handler) GetHabits(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	userID, err := middleware.UserIDFromContext(r.Context())

	if err != nil {
		log.Printf("could not parse user id from context %v", err)
		httpx.SendError[any](w, http.StatusUnauthorized, nil, "unauthorized", "")
		return
	}

	archivedStr := r.URL.Query().Get("archived")
	if archivedStr == "" {
		log.Printf("missing archived query parameter")
		httpx.SendError[any](w, http.StatusBadRequest, nil, "missing archived parameter", "")
		return
	}
	archived, err := strconv.ParseBool(archivedStr)
	if err != nil {
		log.Printf("invalid archived query parameter: %v", err)
		httpx.SendError[any](w, http.StatusBadRequest, nil, "invalid archived parameter", "")
		return
	}

	habits, err := h.service.GetHabits(ctx, userID, archived)
	if err != nil {
		log.Printf("could not fetch habits: %v", err)
		httpx.SendError[any](w, http.StatusInternalServerError, nil, "internal server error", "")
		return
	}

	httpx.SendSuccess[[]HabitDTO](w, http.StatusOK, habits, "habits fetched successfully")
}

func (h *Handler) DeleteHabit(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	userID, err := middleware.UserIDFromContext(r.Context())

	if err != nil {
		log.Printf("could not parse user id from context")
		httpx.SendError[any](w, http.StatusUnauthorized, nil, "unauthorized", "")
		return
	}

	habitID, err := uuid.Parse(chi.URLParam(r, "habitID"))
	if err != nil {
		log.Printf("invalid habit id: %v", err)
		httpx.SendError[any](w, http.StatusBadRequest, nil, "invalid habit id", "")
		return
	}

	err = h.service.DeleteHabit(ctx, userID, habitID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Printf("habit not found: %v", err)
			httpx.SendError[any](w, http.StatusNotFound, nil, "habit not found", "")
			return
		}
		log.Printf("could not delete habit: %v", err)
		httpx.SendError[any](w, http.StatusInternalServerError, nil, "internal server error", "")
		return
	}

	httpx.SendSuccess[any](w, http.StatusNoContent, nil, "habit deleted successfully")
}

func (h *Handler) RestoreHabit(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	userID, err := middleware.UserIDFromContext(r.Context())

	if err != nil {
		log.Printf("could not parse user id from context")
		httpx.SendError[any](w, http.StatusUnauthorized, nil, "unauthorized", "")
		return
	}

	habitID, err := uuid.Parse(chi.URLParam(r, "habitID"))
	if err != nil {
		log.Printf("invalid habit id: %v", err)
		httpx.SendError[any](w, http.StatusBadRequest, nil, "invalid habit id", "")
		return
	}

	err = h.service.RestoreHabit(ctx, userID, habitID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Printf("habit not found: %v", err)
			httpx.SendError[any](w, http.StatusNotFound, nil, "habit not found", "")
			return
		}
		log.Printf("could not delete habit: %v", err)
		httpx.SendError[any](w, http.StatusInternalServerError, nil, "internal server error", "")
		return
	}

	httpx.SendSuccess[any](w, http.StatusOK, nil, "habit Restored successfully")
}

func (h *Handler) UpdateHabit(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	userId, err := middleware.UserIDFromContext(r.Context())
	if err != nil {
		log.Printf("could not extract user id from context: %v", err)
		httpx.SendError[any](w, http.StatusUnauthorized, nil, "unauthorized", "")
		return
	}

	habitID, err := uuid.Parse(chi.URLParam(r, "habitID"))
	if err != nil {
		log.Printf("invalid habit id: %v", err)
		httpx.SendError[any](w, http.StatusBadRequest, nil, "invalid habit id", "")
		return
	}

	payload, err := validation.PayloadValidation[HabitPatchRequest](w, r, h.validate)
	if err != nil {
		return
	}

	habit, err := h.service.UpdateHabit(ctx, userId, habitID, payload)
	if err != nil {
		if errors.Is(err, ErrNoFieldsToUpdate) {
			log.Printf("no fields to update: %v", err)
			httpx.SendError[any](w, http.StatusBadRequest, nil, "no fields to update", "")
			return
		}
		if sendAppError(w, err) {
			return
		}
		if errors.Is(err, pgx.ErrNoRows) {
			log.Printf("habit not found: %v", err)
			httpx.SendError[any](w, http.StatusNotFound, nil, "habit not found", "")
			return
		}
		log.Printf("could not update habit: %v", err)
		httpx.SendError[any](w, http.StatusInternalServerError, nil, "internal server error", "")
		return
	}

	httpx.SendSuccess[HabitDTO](w, http.StatusOK, habit, "habit updated successfully")
}

func (h *Handler) GetWeekLogs(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	userId, err := middleware.UserIDFromContext(r.Context())
	if err != nil {
		log.Printf("could not extract user id from context: %v", err)
		httpx.SendError[any](w, http.StatusUnauthorized, nil, "unauthorized", "")
		return
	}
	date, err := time.Parse("2006-01-02", r.URL.Query().Get("date"))
	if err != nil {
		log.Printf("invalid date query parameter: %v", err)
		httpx.SendError[any](w, http.StatusBadRequest, nil, "invalid date query", "")
		return
	}
	startDate, endDate := CalculatePreviousWeek(date)
	habitLog, err := h.service.GetLogs(ctx, userId, startDate, endDate)

	if err != nil {
		log.Printf("could not fetch habits logs: %v", err)
		httpx.SendError[any](w, http.StatusInternalServerError, nil, "internal server error", "")
		return
	}
	httpx.SendSuccess[[]HabitDTO](w, http.StatusOK, habitLog, "habit logs fetched successfully")

}

func (h *Handler) GetMonthLogs(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	userId, err := middleware.UserIDFromContext(r.Context())
	if err != nil {
		log.Printf("could not extract user id from context: %v", err)
		httpx.SendError[any](w, http.StatusUnauthorized, nil, "unauthorized", "")
		return
	}

	date, err := time.Parse("2006-01-02", r.URL.Query().Get("date"))
	if err != nil {
		log.Printf("invalid date query parameter: %v", err)
		httpx.SendError[any](w, http.StatusBadRequest, nil, "invalid date query", "")
		return
	}

	startDate, endDate := CalculatePreviousMonth(date)

	habitLog, err := h.service.GetLogs(ctx, userId, startDate, endDate)

	if err != nil {
		log.Printf("could not fetch habits logs: %v", err)
		httpx.SendError[any](w, http.StatusInternalServerError, nil, "internal server error", "")
		return
	}
	httpx.SendSuccess[[]HabitDTO](w, http.StatusOK, habitLog, "habit logs fetched successfully")
}

func (h *Handler) SetHabitLog(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	userID, err := middleware.UserIDFromContext(r.Context())
	if err != nil {
		log.Printf("could not extract user id from context: %v", err)
		httpx.SendError[any](w, http.StatusUnauthorized, nil, "unauthorized", "")
		return
	}

	habitID, err := uuid.Parse(chi.URLParam(r, "habitID"))
	if err != nil {
		log.Printf("invalid habit id: %v", err)
		httpx.SendError[any](w, http.StatusBadRequest, nil, "invalid habit id", "")
		return
	}

	date, err := time.Parse("2006-01-02", chi.URLParam(r, "date"))
	if err != nil {
		log.Printf("invalid date: %v", err)
		httpx.SendError[any](w, http.StatusBadRequest, nil, "invalid date", "")
		return
	}

	payload, err := validation.PayloadValidation[SetHabitLogRequest](w, r, h.validate)
	if err != nil {
		return
	}

	err = h.service.SetLog(ctx, userID, habitID, date, payload.Value)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Printf("habit not found or no entry for date: %v", err)
			httpx.SendError[any](w, http.StatusNotFound, nil, "habit not found", "")
			return
		}
		if sendAppError(w, err) {
			return
		}
		log.Printf("could not set habit log: %v", err)
		httpx.SendError[any](w, http.StatusInternalServerError, nil, "internal server error", "")
		return
	}
	httpx.SendSuccess[any](w, http.StatusOK, nil, "habit log set successfully")

}
