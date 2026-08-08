package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-playground/validator/v10"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/markbates/goth/gothic"
)

type Handler struct {
	service  *Service
	validate *validator.Validate
}

const (
	CodeEmailNotVerified  = "EMAIL_NOT_VERIFIED"
	CodeTooManyAttempts   = "TOO_MANY_ATTEMPTS"
	CodeRateLimitExceeded = "RATE_LIMIT_EXCEEDED"
	CodeTokenNotValid     = "TOKEN_NOT_VALID"

	ErrTooManyAttempts   = "too many failed login attempts, please try again later"
	ErrEmailOrUserTaken  = "email or username is already registered"
	ErrTokenNotValid     = "token is not valid"
	ErrIdentityInvalid   = "invalid email or username"
	ErrPasswordInvalid   = "invalid password"
	ErrEmailNotVerified  = "email not verified"
	ErrRateLimitExceeded = "please wait 60 seconds before requesting another email"
	ErrAccountDisabled   = "account disabled"
)

func NewHandler(service *Service) *Handler {

	return &Handler{service: service, validate: NewValidator()}
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var payload SignupRequest

	// Decode payload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		log.Printf("failed to decode request body: %v", err)
		utils.SendError[any](w, http.StatusBadRequest, nil, "Malformed JSON payload", "")
		return
	}
	// validation
	if err := h.validate.Struct(payload); err != nil {
		log.Printf("validation failed: %v", err)
		utils.SendError[any](w, http.StatusBadRequest, nil, "Invalid request payload", "")
		return
	}

	// create user
	user, err := h.service.CreateUser(ctx, payload)
	if err != nil {
		if err.Error() == ErrEmailOrUserTaken {
			log.Printf("user registration conflict: %v", err)
			utils.SendError[any](w, http.StatusBadRequest, nil, ErrEmailOrUserTaken, "")
			return
		}
		log.Printf("failed to create user: %v", err)
		utils.SendError[any](w, http.StatusInternalServerError, nil, "Failed to create user", "")
		return
	}
	utils.SendSuccess[utils.UserResponse](w, http.StatusCreated, user, "user created successfully")
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var payload LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		log.Printf("failed to decode request body: %v", err)
		utils.SendError[any](w, http.StatusBadRequest, nil, "Malformed JSON payload", "")
		return
	}

	if err := h.validate.Struct(payload); err != nil {
		log.Printf("validation failed: %v", err)
		utils.SendError[any](w, http.StatusBadRequest, nil, "Invalid request payload", "")
		return
	}

	ip := middleware.GetClientIP(r.Context())
	ipText := pgtype.Text{
		String: ip,
		Valid:  ip != "",
	}
	userAgent := r.UserAgent()
	userAgentText := pgtype.Text{
		String: userAgent,
		Valid:  userAgent != "",
	}
	user, rawToken, err := h.service.VerifyUser(ctx, payload, ipText, userAgentText)
	if err != nil {
		switch err.Error() {
		case ErrIdentityInvalid, ErrPasswordInvalid:
			log.Printf("identity validation failed: %v", err)
			utils.SendError[any](w, http.StatusBadRequest, nil, "Invalid credentials", "")
			return
		case ErrTooManyAttempts:
			log.Printf("too many failed login attempts, please try again later")
			utils.SendError[any](w, http.StatusTooManyRequests, nil, ErrTooManyAttempts, CodeTooManyAttempts)
			return
		case ErrEmailNotVerified:
			log.Printf("email not verified: %v", err)
			log.Printf("email in EMAIL_NOT_VERIFIED : %v", user.Email)
			utils.SendError[map[string]string](w, http.StatusForbidden, map[string]string{"email": user.Email}, ErrEmailNotVerified, CodeEmailNotVerified)
			return
		case ErrAccountDisabled:
			log.Printf("account disabled: %v", err)
			utils.SendError[any](w, http.StatusForbidden, nil, ErrAccountDisabled, "")
			return
		}
		log.Printf("failed to verify user: %v", err)
		utils.SendError[any](w, http.StatusInternalServerError, nil, "Failed to verify user", "")
		return
	}
	utils.SetCookie(w, "session_token", rawToken, h.service.config.AppEnv)
	utils.SendSuccess(w, http.StatusOK, user, "user logged in")
}
func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	cookieName := utils.SessionCookieName("session_token", h.service.config.AppEnv)
	if cookie, err := r.Cookie(cookieName); err == nil {
		hashedToken := utils.HashFunc(cookie.Value)
		if err := h.service.DeleteSession(ctx, hashedToken); err != nil {
			log.Printf("failed to delete session: %v", err)
			utils.SendError[any](w, http.StatusInternalServerError, nil, "Failed to logout", "")
			return
		}
	}
	http.SetCookie(w, &http.Cookie{
		Name:     cookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   h.service.config.AppEnv == "production",
		SameSite: http.SameSiteLaxMode,
	})
	utils.SendSuccess[any](w, http.StatusOK, nil, "logout successfully")
}

func (h *Handler) ResendVerificationEmail(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	var payload ResendEmailVerificationRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		log.Printf("failed to decode request body: %v", err)
		utils.SendError[any](w, http.StatusBadRequest, nil, "Malformed JSON payload", "")
		return
	}
	if err := h.validate.Struct(payload); err != nil {
		log.Printf("validation failed: %v", err)
		utils.SendError[any](w, http.StatusBadRequest, nil, "Invalid request payload", "")
		return
	}
	err := h.service.ResendEmailVerification(ctx, payload.Email)
	if err != nil {
		if err.Error() == ErrRateLimitExceeded {
			log.Printf("email resend limit exceeded: %v", err)
			utils.SendError[any](w, http.StatusTooManyRequests, nil, ErrRateLimitExceeded, CodeRateLimitExceeded)
			return
		}
		log.Printf("failed to resend email: %v", err)
		utils.SendError[any](w, http.StatusInternalServerError, nil, "Failed to resend email", "")
		return
	}
	utils.SendSuccess[any](w, http.StatusOK, nil, "we have sent a new verification link")
}
func (h *Handler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	var payload ForgotPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		log.Printf("failed to decode request body: %v", err)
		utils.SendError[any](w, http.StatusBadRequest, nil, "Malformed JSON payload", "")
		return
	}
	if err := h.validate.Struct(payload); err != nil {
		log.Printf("validation failed: %v", err)
		utils.SendError[any](w, http.StatusBadRequest, nil, "Invalid request payload", "")
		return
	}
	err := h.service.sendEmailResetPassword(ctx, payload.Email)
	if err != nil {
		if err.Error() == ErrRateLimitExceeded {
			log.Printf("email resend limit exceeded: %v", err)
			utils.SendError[any](w, http.StatusTooManyRequests, nil, ErrRateLimitExceeded, CodeRateLimitExceeded)
			return
		}
		log.Printf("failed to resend email: %v", err)
		utils.SendError[any](w, http.StatusInternalServerError, nil, "Failed to reset password", "")
		return
	}
	utils.SendSuccess[any](w, http.StatusOK, nil, "we sent a password reset link , verify your email")
}

func (h *Handler) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	token := r.URL.Query().Get("token")
	if token == "" {
		log.Printf("missing token query parameter")
		utils.SendError[any](w, http.StatusBadRequest, nil, "Missing token", "")
		return
	}

	err := h.service.verifyTokenEmail(ctx, token)
	if err != nil {
		if err.Error() == ErrTokenNotValid {
			log.Printf("token not valid: %v", err)
			utils.SendError[any](w, http.StatusUnauthorized, nil, ErrTokenNotValid, CodeTokenNotValid)
			return
		}
		log.Printf("failed to verify token: %v", err)
		utils.SendError[any](w, http.StatusInternalServerError, nil, "Failed to verify token", "")
		return
	}
	utils.SendSuccess[any](w, http.StatusOK, nil, "email verified successfully")

}
func (h *Handler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var payload ResetPasswordRequest

	token := r.URL.Query().Get("token")
	if token == "" {
		log.Printf("missing token query parameter")
		utils.SendError[any](w, http.StatusBadRequest, nil, "Missing token", "")
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		log.Printf("failed to decode request body: %v", err)
		utils.SendError[any](w, http.StatusBadRequest, nil, "Malformed JSON payload", "")
		return
	}
	if err := h.validate.Struct(payload); err != nil {
		log.Printf("validation failed: %v", err)
		utils.SendError[any](w, http.StatusBadRequest, nil, "Invalid request payload", "")
		return
	}

	err := h.service.VerifyTokenPassword(ctx, token, payload.Password)
	if err != nil {
		if err.Error() == ErrTokenNotValid {
			log.Printf("token not valid: %v", err)
			utils.SendError[any](w, http.StatusUnauthorized, nil, ErrTokenNotValid, CodeTokenNotValid)
			return
		}
		log.Printf("failed to verify token: %v", err)
		utils.SendError[any](w, http.StatusInternalServerError, nil, "Failed to verify token", "")
		return
	}
	utils.SendSuccess[any](w, http.StatusOK, nil, "password reset successfully")
}

// GothLogin and GothCallBack  :
func (h *Handler) GothLogin(w http.ResponseWriter, r *http.Request) {
	provider := chi.URLParam(r, "provider")
	gothic.GetProviderName = func(*http.Request) (string, error) { return provider, nil }

	gothic.BeginAuthHandler(w, r)
}
func (h *Handler) GothCallback(w http.ResponseWriter, r *http.Request) {
	provider := chi.URLParam(r, "provider")
	gothic.GetProviderName = func(*http.Request) (string, error) { return provider, nil }

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	gothUser, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		log.Printf("%s complete auth failed: %v", provider, err)
		utils.SendError[any](w, http.StatusUnauthorized, nil, fmt.Sprintf("%s complete auth failed", provider), "")
		return
	}

	user, err := h.service.OAuthLogin(ctx, gothUser, provider)
	if err != nil {
		if err.Error() == ErrEmailOrUserTaken {
			log.Printf("oauth email conflict: %v", err)
			utils.SendError[any](w, http.StatusConflict, nil, ErrEmailOrUserTaken, "")
			return
		}
		if err.Error() == ErrAccountDisabled {
			log.Printf("account disabled: %v", err)
			utils.SendError[any](w, http.StatusForbidden, nil, ErrAccountDisabled, "")
			return
		}
		log.Printf("oauth login failed: %v", err)
		utils.SendError[any](w, http.StatusInternalServerError, nil, "failed to sign in", "")
		return
	}

	ip := middleware.GetClientIP(r.Context())
	ipText := pgtype.Text{
		String: ip,
		Valid:  ip != "",
	}
	userAgent := r.UserAgent()
	userAgentText := pgtype.Text{
		String: userAgent,
		Valid:  userAgent != "",
	}
	rawToken, err := h.service.CreateSessionForUser(ctx, user.ID, ipText, userAgentText)

	if err != nil {
		log.Printf("failed to create oauth session: %v", err)
		utils.SendError[any](w, http.StatusInternalServerError, nil, "failed to start session", "")
		return
	}
	utils.SetCookie(w, "session_token", rawToken, h.service.config.AppEnv)
	http.Redirect(w, r, h.service.config.FrontendURL, http.StatusTemporaryRedirect)
}
