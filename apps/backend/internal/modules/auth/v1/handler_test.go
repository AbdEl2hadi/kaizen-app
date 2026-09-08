package v1

import (
	"context"
	"errors"
	"net/http"
	"testing"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/config"
	sqlc "github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/db/sqlc"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils/httpx"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/markbates/goth"
	"uuid"
)

const (
	validSignupBody = `{
		"fullName": "John Doe",
		"username": "john.doe",
		"email": "john@example.com",
		"password": "Password123!",
		"confirmPassword": "Password123!",
		"dateOfBirth": "2000-01-15",
		"timeZone": "UTC"
	}`
	validLoginBody = `{
		"identity" : "joe@example.com",
		"password" : "Password123!"
	}`
	validResetPasswordBody = `{
		"password": "NewPassword123!",
		"confirmPassword": "NewPassword123!"
	}`
)

func TestHandler_Register(t *testing.T) {
	runHandlerTests(t, func(s *mockAuthService) http.HandlerFunc {
		return NewHandler(s, &config.Config{}).Register
	}, []handlerCase{
		{
			name: "success", method: http.MethodPost, path: "/register", body: validSignupBody,
			setup: func(s *mockAuthService) {
				s.createUserFn = func(ctx context.Context, p SignupRequest) (httpx.UserResponse, error) {
					return httpx.UserResponse{ID: uuid.MustParse("00000000-0000-0000-0000-000000000001"), Username: p.Username, Email: p.Email}, nil
				}
			},
			wantStatus: http.StatusCreated, wantCalls: 1,
		},
		{
			name: "email already exists", method: http.MethodPost, path: "/register", body: validSignupBody,
			setup: func(s *mockAuthService) {
				s.createUserFn = func(ctx context.Context, p SignupRequest) (httpx.UserResponse, error) {
					return httpx.UserResponse{}, errors.New(ErrEmailOrUserTaken)
				}
			},
			wantStatus: http.StatusBadRequest, wantCalls: 1,
		},
		{
			name: "service error", method: http.MethodPost, path: "/register", body: validSignupBody,
			setup: func(s *mockAuthService) {
				s.createUserFn = func(ctx context.Context, p SignupRequest) (httpx.UserResponse, error) {
					return httpx.UserResponse{}, errors.New("db unavailable")
				}
			},
			wantStatus: http.StatusInternalServerError, wantCalls: 1,
		},
		{
			name: "invalid json", method: http.MethodPost, path: "/register", body: `{"username":`,
			wantStatus: http.StatusBadRequest,
		},
		{
			name: "validation fails - missing fields", method: http.MethodPost, path: "/register",
			body:       `{"username":"john.doe","email":"john@example.com","password":"Password123!"}`,
			wantStatus: http.StatusBadRequest,
		},
	})
}

func TestHandler_Login(t *testing.T) {
	runHandlerTests(t, func(s *mockAuthService) http.HandlerFunc {
		return NewHandler(s, &config.Config{}).Login
	}, []handlerCase{
		{
			name: "success", method: http.MethodPost, path: "/login", body: validLoginBody,
			setup: func(s *mockAuthService) {
				s.verifyUserFn = func(ctx context.Context, payload LoginRequest, ip pgtype.Text, userAgent pgtype.Text) (httpx.UserResponse, string, error) {
					return httpx.UserResponse{ID: uuid.MustParse("00000000-0000-0000-0000-000000000001"), Username: payload.Identity, Email: payload.Identity}, "", nil
				}
			},
			wantStatus: http.StatusOK, wantCalls: 1,
		},
		{
			name: "invalid json", method: http.MethodPost, path: "/login", body: `{"username":`,
			wantStatus: http.StatusBadRequest,
		},
		{
			name: "validation fails", method: http.MethodPost, path: "/login",
			body:       `{"identity":"jh","password":"Password123!"}`,
			wantStatus: http.StatusBadRequest,
		},
		{
			name: "invalid identity", method: http.MethodPost, path: "/login", body: validLoginBody,
			setup: func(s *mockAuthService) {
				s.verifyUserFn = func(ctx context.Context, payload LoginRequest, ip pgtype.Text, userAgent pgtype.Text) (httpx.UserResponse, string, error) {
					return httpx.UserResponse{}, "", errors.New(ErrIdentityInvalid)
				}
			},
			wantStatus: http.StatusBadRequest, wantCalls: 1,
		},
		{
			name: "invalid password", method: http.MethodPost, path: "/login", body: validLoginBody,
			setup: func(s *mockAuthService) {
				s.verifyUserFn = func(ctx context.Context, payload LoginRequest, ip pgtype.Text, userAgent pgtype.Text) (httpx.UserResponse, string, error) {
					return httpx.UserResponse{}, "", errors.New(ErrPasswordInvalid)
				}
			},
			wantStatus: http.StatusBadRequest, wantCalls: 1,
		},
		{
			name: "Too many attempts", method: http.MethodPost, path: "/login", body: validLoginBody,
			setup: func(s *mockAuthService) {
				s.verifyUserFn = func(ctx context.Context, payload LoginRequest, ip pgtype.Text, userAgent pgtype.Text) (httpx.UserResponse, string, error) {
					return httpx.UserResponse{}, "", errors.New(ErrTooManyAttempts)
				}
			},
			wantStatus: http.StatusTooManyRequests, wantCode: CodeTooManyAttempts, wantCalls: 1,
		},
		{
			name: "email not verified", method: http.MethodPost, path: "/login", body: validLoginBody,
			setup: func(s *mockAuthService) {
				s.verifyUserFn = func(ctx context.Context, payload LoginRequest, ip pgtype.Text, userAgent pgtype.Text) (httpx.UserResponse, string, error) {
					return httpx.UserResponse{}, "", errors.New(ErrEmailNotVerified)
				}
			},
			wantStatus: http.StatusForbidden, wantCode: CodeEmailNotVerified, wantCalls: 1,
		},
		{
			name: "account disabled", method: http.MethodPost, path: "/login", body: validLoginBody,
			setup: func(s *mockAuthService) {
				s.verifyUserFn = func(ctx context.Context, payload LoginRequest, ip pgtype.Text, userAgent pgtype.Text) (httpx.UserResponse, string, error) {
					return httpx.UserResponse{}, "", errors.New(ErrAccountDisabled)
				}
			},
			wantStatus: http.StatusForbidden, wantCalls: 1,
		},
		{
			name: "server error", method: http.MethodPost, path: "/login", body: validLoginBody,
			setup: func(s *mockAuthService) {
				s.verifyUserFn = func(ctx context.Context, payload LoginRequest, ip pgtype.Text, userAgent pgtype.Text) (httpx.UserResponse, string, error) {
					return httpx.UserResponse{}, "", errors.New("db unavailable")
				}
			},
			wantStatus: http.StatusInternalServerError, wantCalls: 1,
		},
	})
}

func TestHandler_Logout(t *testing.T) {
	runHandlerTests(t, func(s *mockAuthService) http.HandlerFunc {
		return NewHandler(s, &config.Config{}).Logout
	}, []handlerCase{
		{
			name: "success with session", method: http.MethodPost, path: "/logout", cookie: "token-123",
			setup: func(s *mockAuthService) {
				s.deleteSessionFn = func(ctx context.Context, tokenHash string) error {
					return nil
				}
			},
			wantStatus: http.StatusOK, wantCalls: 1,
		},
		{
			name: "success without session", method: http.MethodPost, path: "/logout",
			wantStatus: http.StatusOK, wantCalls: 0,
		},
		{
			name: "service error", method: http.MethodPost, path: "/logout", cookie: "token-123",
			setup: func(s *mockAuthService) {
				s.deleteSessionFn = func(ctx context.Context, tokenHash string) error {
					return errors.New("db unavailable")
				}
			},
			wantStatus: http.StatusInternalServerError, wantCalls: 1,
		},
	})
}

func TestHandler_ResendVerificationEmail(t *testing.T) {
	const validBody = `{"email": "john@example.com"}`

	runHandlerTests(t, func(s *mockAuthService) http.HandlerFunc {
		return NewHandler(s, &config.Config{}).ResendVerificationEmail
	}, []handlerCase{
		{
			name: "success", method: http.MethodPost, path: "/resend-verification", body: validBody,
			setup: func(s *mockAuthService) {
				s.resendEmailVerificationFn = func(ctx context.Context, email string) error {
					return nil
				}
			},
			wantStatus: http.StatusOK, wantCalls: 1,
		},
		{
			name: "invalid json", method: http.MethodPost, path: "/resend-verification", body: `{"email":`,
			wantStatus: http.StatusBadRequest,
		},
		{
			name: "validation fails - invalid email", method: http.MethodPost, path: "/resend-verification",
			body:       `{"email": "not-an-email"}`,
			wantStatus: http.StatusBadRequest,
		},
		{
			name: "rate limit exceeded", method: http.MethodPost, path: "/resend-verification", body: validBody,
			setup: func(s *mockAuthService) {
				s.resendEmailVerificationFn = func(ctx context.Context, email string) error {
					return errors.New(ErrRateLimitExceeded)
				}
			},
			wantStatus: http.StatusTooManyRequests, wantCode: CodeRateLimitExceeded, wantCalls: 1,
		},
		{
			name: "server error", method: http.MethodPost, path: "/resend-verification", body: validBody,
			setup: func(s *mockAuthService) {
				s.resendEmailVerificationFn = func(ctx context.Context, email string) error {
					return errors.New("db unavailable")
				}
			},
			wantStatus: http.StatusInternalServerError, wantCalls: 1,
		},
	})
}

func TestHandler_ForgotPassword(t *testing.T) {
	const validBody = `{"email": "john@example.com"}`

	runHandlerTests(t, func(s *mockAuthService) http.HandlerFunc {
		return NewHandler(s, &config.Config{}).ForgotPassword
	}, []handlerCase{
		{
			name: "success", method: http.MethodPost, path: "/forgot-password", body: validBody,
			setup: func(s *mockAuthService) {
				s.forgotPasswordFn = func(ctx context.Context, email string) error {
					return nil
				}
			},
			wantStatus: http.StatusOK, wantCalls: 1,
		},
		{
			name: "invalid json", method: http.MethodPost, path: "/forgot-password", body: `{"email":`,
			wantStatus: http.StatusBadRequest,
		},
		{
			name: "validation fails - invalid email", method: http.MethodPost, path: "/forgot-password",
			body:       `{"email": "not-an-email"}`,
			wantStatus: http.StatusBadRequest,
		},
		{
			name: "rate limit exceeded", method: http.MethodPost, path: "/forgot-password", body: validBody,
			setup: func(s *mockAuthService) {
				s.forgotPasswordFn = func(ctx context.Context, email string) error {
					return errors.New(ErrRateLimitExceeded)
				}
			},
			wantStatus: http.StatusTooManyRequests, wantCode: CodeRateLimitExceeded, wantCalls: 1,
		},
		{
			name: "server error", method: http.MethodPost, path: "/forgot-password", body: validBody,
			setup: func(s *mockAuthService) {
				s.forgotPasswordFn = func(ctx context.Context, email string) error {
					return errors.New("db unavailable")
				}
			},
			wantStatus: http.StatusInternalServerError, wantCalls: 1,
		},
	})
}

func TestHandler_VerifyEmail(t *testing.T) {
	runHandlerTests(t, func(s *mockAuthService) http.HandlerFunc {
		return NewHandler(s, &config.Config{}).VerifyEmail
	}, []handlerCase{
		{
			name: "success", method: http.MethodPost, path: "/verify-email", token: "valid-token",
			setup: func(s *mockAuthService) {
				s.verifyTokenFn = func(ctx context.Context, rawToken, password string, tokenType sqlc.Tokentype) error {
					return nil
				}
			},
			wantStatus: http.StatusOK, wantCalls: 1,
		},
		{
			name: "missing token", method: http.MethodPost, path: "/verify-email",
			wantStatus: http.StatusBadRequest, wantCalls: 0,
		},
		{
			name: "invalid token", method: http.MethodPost, path: "/verify-email", token: "expired-token",
			setup: func(s *mockAuthService) {
				s.verifyTokenFn = func(ctx context.Context, rawToken, password string, tokenType sqlc.Tokentype) error {
					return errors.New(ErrTokenNotValid)
				}
			},
			wantStatus: http.StatusUnauthorized, wantCode: CodeTokenNotValid, wantCalls: 1,
		},
		{
			name: "server error", method: http.MethodPost, path: "/verify-email", token: "valid-token",
			setup: func(s *mockAuthService) {
				s.verifyTokenFn = func(ctx context.Context, rawToken, password string, tokenType sqlc.Tokentype) error {
					return errors.New("db unavailable")
				}
			},
			wantStatus: http.StatusInternalServerError, wantCalls: 1,
		},
	})
}

func TestHandler_ResetPassword(t *testing.T) {
	runHandlerTests(t, func(s *mockAuthService) http.HandlerFunc {
		return NewHandler(s, &config.Config{}).ResetPassword
	}, []handlerCase{
		{
			name: "success", method: http.MethodPost, path: "/reset-password", token: "valid-token", body: validResetPasswordBody,
			setup: func(s *mockAuthService) {
				s.verifyTokenFn = func(ctx context.Context, rawToken, password string, tokenType sqlc.Tokentype) error {
					return nil
				}
			},
			wantStatus: http.StatusOK, wantCalls: 1,
		},
		{
			name: "missing token", method: http.MethodPost, path: "/reset-password", body: validResetPasswordBody,
			wantStatus: http.StatusBadRequest, wantCalls: 0,
		},
		{
			name: "invalid token", method: http.MethodPost, path: "/reset-password", token: "expired-token", body: validResetPasswordBody,
			setup: func(s *mockAuthService) {
				s.verifyTokenFn = func(ctx context.Context, rawToken, password string, tokenType sqlc.Tokentype) error {
					return errors.New(ErrTokenNotValid)
				}
			},
			wantStatus: http.StatusUnauthorized, wantCode: CodeTokenNotValid, wantCalls: 1,
		},
		{
			name: "server error", method: http.MethodPost, path: "/reset-password", token: "valid-token", body: validResetPasswordBody,
			setup: func(s *mockAuthService) {
				s.verifyTokenFn = func(ctx context.Context, rawToken, password string, tokenType sqlc.Tokentype) error {
					return errors.New("db unavailable")
				}
			},
			wantStatus: http.StatusInternalServerError, wantCalls: 1,
		},
		{
			name: "invalid json", method: http.MethodPost, path: "/reset-password", token: "valid-token",
			body:       `{"password":`,
			wantStatus: http.StatusBadRequest, wantCalls: 0,
		},
		{
			name: "validation fails - password mismatch", method: http.MethodPost, path: "/reset-password", token: "valid-token",
			body:       `{"password": "NewPassword123!", "confirmPassword": "Different123!"}`,
			wantStatus: http.StatusBadRequest, wantCalls: 0,
		},
	})
}

func TestHandler_GothLogin(t *testing.T) {
	const (
		providerName = "mock-login"
		authURL      = "https://provider.example.com/auth?state=abc123"
	)

	goth.UseProviders(&mockGothProvider{name: providerName, authURL: authURL})

	runHandlerTests(t, func(s *mockAuthService) http.HandlerFunc {
		return NewHandler(s, &config.Config{}).GothLogin
	}, []handlerCase{
		{
			name: "success - redirects to provider", method: http.MethodGet, path: "/auth/" + providerName,
			prepare:    prepareProviderParam(providerName),
			wantStatus: http.StatusTemporaryRedirect, wantLocation: authURL,
		},
		{
			name: "unknown provider", method: http.MethodGet, path: "/auth/unknown",
			prepare:    prepareProviderParam("unknown"),
			wantStatus: http.StatusBadRequest,
		},
	})
}

func TestHandler_GothCallback(t *testing.T) {
	const (
		providerName = "mock-callback"
		authURL      = "https://provider.example.com/auth?state=abc123"
	)

	gothUser := goth.User{
		Email:    "john@example.com",
		NickName: "john.doe",
	}

	goth.UseProviders(
		&mockGothProvider{
			name:    providerName,
			authURL: authURL,
			fetchUserFn: func(session goth.Session) (goth.User, error) {
				return gothUser, nil
			},
		},
		&mockGothProvider{
			name:    providerName + "-fail",
			authURL: authURL,
			fetchUserFn: func(session goth.Session) (goth.User, error) {
				return goth.User{}, errors.New("provider error")
			},
			authorizeFn: func(provider goth.Provider, params goth.Params) (string, error) {
				return "", errors.New("authorize error")
			},
		},
	)

	runHandlerTests(t, func(s *mockAuthService) http.HandlerFunc {
		return NewHandler(s, &config.Config{FrontendURL: "/"}).GothCallback
	}, []handlerCase{
		{
			name: "success", method: http.MethodGet, path: "/auth/" + providerName + "/callback?state=abc123",
			prepare: prepareGothCallback(providerName),
			setup: func(s *mockAuthService) {
				s.oauthLoginFn = func(ctx context.Context, user goth.User, provider string) (sqlc.User, error) {
					return sqlc.User{ID: uuid.New(), Email: user.Email}, nil
				}
				s.createSessionForUserFn = func(ctx context.Context, userID uuid.UUID, ip, userAgent pgtype.Text) (string, error) {
					return "raw-token", nil
				}
			},
			wantStatus: http.StatusTemporaryRedirect, wantLocation: "/", wantCalls: 2,
		},
		{
			name: "complete auth failed", method: http.MethodGet, path: "/auth/" + providerName + "-fail/callback?state=abc123",
			prepare:    prepareGothCallback(providerName + "-fail"),
			wantStatus: http.StatusUnauthorized, wantCalls: 0,
		},
		{
			name: "email already registered", method: http.MethodGet, path: "/auth/" + providerName + "/callback?state=abc123",
			prepare: prepareGothCallback(providerName),
			setup: func(s *mockAuthService) {
				s.oauthLoginFn = func(ctx context.Context, user goth.User, provider string) (sqlc.User, error) {
					return sqlc.User{}, errors.New(ErrEmailOrUserTaken)
				}
			},
			wantStatus: http.StatusConflict, wantCalls: 1,
		},
		{
			name: "account disabled", method: http.MethodGet, path: "/auth/" + providerName + "/callback?state=abc123",
			prepare: prepareGothCallback(providerName),
			setup: func(s *mockAuthService) {
				s.oauthLoginFn = func(ctx context.Context, user goth.User, provider string) (sqlc.User, error) {
					return sqlc.User{}, errors.New(ErrAccountDisabled)
				}
			},
			wantStatus: http.StatusForbidden, wantCalls: 1,
		},
		{
			name: "oauth login server error", method: http.MethodGet, path: "/auth/" + providerName + "/callback?state=abc123",
			prepare: prepareGothCallback(providerName),
			setup: func(s *mockAuthService) {
				s.oauthLoginFn = func(ctx context.Context, user goth.User, provider string) (sqlc.User, error) {
					return sqlc.User{}, errors.New("db unavailable")
				}
			},
			wantStatus: http.StatusInternalServerError, wantCalls: 1,
		},
		{
			name: "session creation error", method: http.MethodGet, path: "/auth/" + providerName + "/callback?state=abc123",
			prepare: prepareGothCallback(providerName),
			setup: func(s *mockAuthService) {
				s.oauthLoginFn = func(ctx context.Context, user goth.User, provider string) (sqlc.User, error) {
					return sqlc.User{ID: uuid.New(), Email: user.Email}, nil
				}
				s.createSessionForUserFn = func(ctx context.Context, userID uuid.UUID, ip, userAgent pgtype.Text) (string, error) {
					return "", errors.New("db unavailable")
				}
			},
			wantStatus: http.StatusInternalServerError, wantCalls: 2,
		},
	})
}
