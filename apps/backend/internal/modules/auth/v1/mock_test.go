package v1

import (
	"context"
	"os"
	"testing"

	sqlc "github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/db/sqlc"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils/httpx"
	"github.com/gorilla/sessions"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"golang.org/x/oauth2"
	"uuid"
)

func TestMain(m *testing.M) {
	gothic.Store = sessions.NewCookieStore([]byte("test-secret"))
	os.Exit(m.Run())
}

type mockAuthService struct {
	calls int

	createUserFn              func(ctx context.Context, payload SignupRequest) (httpx.UserResponse, error)
	verifyUserFn              func(ctx context.Context, payload LoginRequest, ip pgtype.Text, userAgent pgtype.Text) (httpx.UserResponse, string, error)
	insertLoginAttemptsFn     func(ctx context.Context, userId *uuid.UUID, ip pgtype.Text, email string, username string, success bool) error
	resendEmailVerificationFn func(ctx context.Context, email string) error
	verifyTokenFn             func(ctx context.Context, rawToken, password string, tokenType sqlc.Tokentype) error
	forgotPasswordFn          func(ctx context.Context, email string) error
	createSessionForUserFn    func(ctx context.Context, userID uuid.UUID, ip, userAgent pgtype.Text) (string, error)
	deleteSessionFn           func(ctx context.Context, tokenHash string) error
	createOAuthUserFn         func(ctx context.Context, qtx *sqlc.Queries, gothUser goth.User) (sqlc.User, error)
	oauthLoginFn              func(ctx context.Context, gothUser goth.User, provider string) (sqlc.User, error)
}

func (m *mockAuthService) CreateUser(ctx context.Context, payload SignupRequest) (httpx.UserResponse, error) {
	m.calls++
	if m.createUserFn == nil {
		panic("mockAuthService.CreateUser was not configured")
	}
	return m.createUserFn(ctx, payload)
}

func (m *mockAuthService) VerifyUser(ctx context.Context, payload LoginRequest, ip pgtype.Text, userAgent pgtype.Text) (httpx.UserResponse, string, error) {
	m.calls++
	if m.verifyUserFn == nil {
		panic("mockAuthService.VerifyUser was not configured")
	}
	return m.verifyUserFn(ctx, payload, ip, userAgent)
}

func (m *mockAuthService) InsertLoginAttempts(ctx context.Context, userId *uuid.UUID, ip pgtype.Text, email string, username string, success bool) error {
	m.calls++
	if m.insertLoginAttemptsFn != nil {
		return m.insertLoginAttemptsFn(ctx, userId, ip, email, username, success)
	}
	return nil
}

func (m *mockAuthService) ResendEmailVerification(ctx context.Context, email string) error {
	m.calls++
	if m.resendEmailVerificationFn != nil {
		return m.resendEmailVerificationFn(ctx, email)
	}
	return nil
}

func (m *mockAuthService) VerifyToken(ctx context.Context, rawToken, password string, tokenType sqlc.Tokentype) error {
	m.calls++
	if m.verifyTokenFn != nil {
		return m.verifyTokenFn(ctx, rawToken, password, tokenType)
	}
	return nil
}

func (m *mockAuthService) ForgotPassword(ctx context.Context, email string) error {
	m.calls++
	if m.forgotPasswordFn != nil {
		return m.forgotPasswordFn(ctx, email)
	}
	return nil
}

func (m *mockAuthService) CreateSessionForUser(ctx context.Context, userID uuid.UUID, ip, userAgent pgtype.Text) (string, error) {
	m.calls++
	if m.createSessionForUserFn != nil {
		return m.createSessionForUserFn(ctx, userID, ip, userAgent)
	}
	return "", nil
}

func (m *mockAuthService) DeleteSession(ctx context.Context, tokenHash string) error {
	m.calls++
	if m.deleteSessionFn != nil {
		return m.deleteSessionFn(ctx, tokenHash)
	}
	return nil
}

func (m *mockAuthService) CreateOAuthUser(ctx context.Context, qtx *sqlc.Queries, gothUser goth.User) (sqlc.User, error) {
	m.calls++
	if m.createOAuthUserFn != nil {
		return m.createOAuthUserFn(ctx, qtx, gothUser)
	}
	return sqlc.User{}, nil
}

func (m *mockAuthService) OAuthLogin(ctx context.Context, gothUser goth.User, provider string) (sqlc.User, error) {
	m.calls++
	if m.oauthLoginFn != nil {
		return m.oauthLoginFn(ctx, gothUser, provider)
	}
	return sqlc.User{}, nil
}

type mockGothProvider struct {
	name        string
	authURL     string
	fetchUserFn func(session goth.Session) (goth.User, error)
	authorizeFn func(provider goth.Provider, params goth.Params) (string, error)
}

func (p *mockGothProvider) Name() string { return p.name }

func (p *mockGothProvider) SetName(name string) { p.name = name }

func (p *mockGothProvider) BeginAuth(state string) (goth.Session, error) {
	return &mockGothSession{provider: p, authURL: p.authURL}, nil
}

func (p *mockGothProvider) UnmarshalSession(s string) (goth.Session, error) {
	return &mockGothSession{provider: p, authURL: p.authURL}, nil
}

func (p *mockGothProvider) FetchUser(session goth.Session) (goth.User, error) {
	if p.fetchUserFn != nil {
		return p.fetchUserFn(session)
	}
	return goth.User{}, nil
}

func (p *mockGothProvider) Debug(debug bool) {}

func (p *mockGothProvider) RefreshToken(refreshToken string) (*oauth2.Token, error) {
	return nil, nil
}

func (p *mockGothProvider) RefreshTokenAvailable() bool { return false }

type mockGothSession struct {
	provider *mockGothProvider
	authURL  string
}

func (s *mockGothSession) GetAuthURL() (string, error) { return s.authURL, nil }

func (s *mockGothSession) Marshal() string { return "mock-session-data" }

func (s *mockGothSession) Authorize(provider goth.Provider, params goth.Params) (string, error) {
	if s.provider != nil && s.provider.authorizeFn != nil {
		return s.provider.authorizeFn(provider, params)
	}
	return "", nil
}
