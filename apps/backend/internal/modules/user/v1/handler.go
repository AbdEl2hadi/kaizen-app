package v1

import (
	"context"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/middleware"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils/httpx"
	"github.com/jackc/pgx/v5"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {

	return &Handler{service: service}
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	userId, err := middleware.UserIDFromContext(r.Context())
	if err != nil {
		log.Print("error getting userId from context")
		httpx.SendError[any](w, http.StatusUnauthorized, nil, "Unauthorized", "")
		return
	}
	user, err := h.service.GetUserByID(ctx, userId)
	if err != nil {

		if errors.Is(err, pgx.ErrNoRows) {
			log.Printf("user not found : %v", err)
			httpx.SendError[any](w, http.StatusUnauthorized, nil, "user not found", "")
			return
		}

		log.Printf("error querying user by ID : %v", err)
		httpx.SendError[any](w, http.StatusInternalServerError, nil, "internal server error", "")
		return
	}
	httpx.SendSuccess[httpx.UserResponse](w, http.StatusOK, httpx.UserResponse{
		ID:            user.ID,
		Email:         user.Email,
		FullName:      user.FullName,
		Username:      user.Username,
		EmailVerified: user.EmailVerified,
		Bio:           user.Bio.String,
		Image:         user.Image.String,
		CreatedAt:     user.CreatedAt.Time.Format(time.RFC3339),
		UpdatedAt:     user.UpdatedAt.Time.Format(time.RFC3339),
		Timezone:      user.Timezone.String,
		DateOfBirth:   user.DateOfBirth.Time.Format(time.RFC3339),
		PhoneNumber:   user.PhoneNumber.String,
	}, "user authenticated")
}
