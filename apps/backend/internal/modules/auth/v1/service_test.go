package v1

import (
	"context"
	"fmt"
	"testing"
	"time"

	"uuid"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/config"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/db/integration"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/db/sqlc"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/mail"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils/date"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils/hash"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils/httpx"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/markbates/goth"
	"github.com/stretchr/testify/require"
)

type serviceTestEnv struct {
	db      *pgxpool.Pool
	service *Service
	query   *sqlc.Queries
	mailer  *mail.RecordingMailer
}

func newTestService(t *testing.T) serviceTestEnv {
	t.Helper()
	db := integration.NewTestDB(t)
	integration.CleanTables(t, db)

	cfg := &config.Config{FrontendURL: "https://test.example.com"}
	mailer := mail.NewRecordingMailer()

	return serviceTestEnv{
		db:      db,
		service: NewService(db, cfg, mailer, nil),
		query:   sqlc.New(db),
		mailer:  mailer,
	}
}

func createUserHelper(t *testing.T, env serviceTestEnv, email string, verified bool) httpx.UserResponse {
	t.Helper()
	user, err := env.service.CreateUser(context.Background(), signupPayload(email))
	require.NoError(t, err)
	if verified {
		err = env.query.SetVerifiedEmail(context.Background(), sqlc.SetVerifiedEmailParams{
			ID:            user.ID,
			EmailVerified: true,
		})
		require.NoError(t, err)
	}
	return user
}

func uniqueEmail(t *testing.T) string {
	t.Helper()
	return fmt.Sprintf("test-%d@example.com", time.Now().UnixNano())
}

func verifyUserHelper(env serviceTestEnv, identity, password string) (httpx.UserResponse, string, error) {
	ip, userAgent := pgtype.Text{String: "127.0.0.1", Valid: true}, pgtype.Text{String: "test_agent", Valid: true}
	return env.service.VerifyUser(context.Background(), LoginRequest{
		Identity: identity,
		Password: password,
	}, ip, userAgent)
}

func signupPayload(email string) SignupRequest {
	return SignupRequest{
		FullName:        "test",
		Username:        "test123",
		Email:           email,
		Password:        "password123",
		ConfirmPassword: "password123",
		DateOfBirth:     date.Date(time.Date(2000, 1, 15, 0, 0, 0, 0, time.UTC)),
		TimeZone:        "UTC",
	}
}

func TestService_CreateUser(t *testing.T) {
	t.Run("creates user and persists related rows", func(t *testing.T) {
		envService := newTestService(t)
		email := uniqueEmail(t)

		user, err := envService.service.CreateUser(context.Background(), signupPayload(email))
		require.NoError(t, err, "step: create user")
		require.Equal(t, "test123", user.Username, "step: create user response")
		require.Equal(t, email, user.Email, "step: create user response")
		require.Equal(t, "test", user.FullName, "step: create user response")
		require.Equal(t, "UTC", user.Timezone, "step: create user response")
		require.Equal(t, "2000-01-15T00:00:00Z", user.DateOfBirth, "step: create user response")
		require.False(t, user.EmailVerified, "step: create user response")

		// users row
		dbUser, err := envService.query.GetUserByEmailOrUsername(context.Background(), email)
		require.NoError(t, err, "step: fetch user from db")
		require.Equal(t, "test123", dbUser.Username, "step: users row")
		require.False(t, dbUser.EmailVerified, "step: users row")
		require.True(t, dbUser.DateOfBirth.Valid, "step: users row")
		require.Equal(t, "2000-01-15", dbUser.DateOfBirth.Time.Format("2006-01-02"), "step: users row")
		require.Equal(t, "UTC", dbUser.Timezone.String, "step: users row")

		// accounts row
		account, err := envService.query.GetAccountByProvider(context.Background(), sqlc.GetAccountByProviderParams{
			Provider:  "credential",
			AccountID: dbUser.ID.String(),
		})
		require.NoError(t, err, "step: fetch credential account")
		require.True(t, checkPasswordHash("password123", account.PasswordHash.String), "step: stored password must hash to password123")
		require.NotEqual(t, "password123", account.PasswordHash.String, "step: password must never be stored in plaintext")

		// verification email captured (raw token only travels by email)
		sent := envService.mailer.WaitForVerificationEmail(t, 5*time.Second)
		require.Equal(t, "https://test.example.comverify-email", sent.VerifyURL, "step: verification email")
		require.Equal(t, "test123", sent.Username, "step: verification email")
		require.Equal(t, dbUser.Email, sent.ToEmail, "step: verification email")

		// tokens row: stored hashed, not raw
		var storedTokenHash string
		err = envService.db.QueryRow(context.Background(),
			`SELECT token_hash FROM tokens
			 WHERE user_id = $1 AND token_type = 'email_verification'
			 ORDER BY created_at DESC LIMIT 1`, dbUser.ID).Scan(&storedTokenHash)
		require.NoError(t, err, "step: fetch verification token")
		require.Equal(t, hash.HashFunc(sent.RawToken), storedTokenHash, "step: token must be stored hashed")
	})

	t.Run("rejects duplicate email", func(t *testing.T) {
		envService := newTestService(t)
		email := uniqueEmail(t)

		_, err := envService.service.CreateUser(context.Background(), signupPayload(email))
		require.NoError(t, err, "step: first create must succeed")

		_, err = envService.service.CreateUser(context.Background(), signupPayload(email))
		require.EqualError(t, err, ErrEmailOrUserTaken, "step: duplicate create must fail")
	})
}

func logsHelper(t *testing.T, withEmail bool) {
	envService := newTestService(t)
	email := uniqueEmail(t)
	userCreated := createUserHelper(t, envService, email, true)
	var user httpx.UserResponse
	var rawToken string
	var err error
	if withEmail {
		user, rawToken, err = verifyUserHelper(envService, email, "password123")
	} else {
		user, rawToken, err = verifyUserHelper(envService, "test123", "password123")
	}

	require.NoError(t, err)
	require.Equal(t, userCreated.Email, user.Email, "step: verify user response")
	require.NotEmpty(t, rawToken, "step: verify user response")
	require.True(t, user.EmailVerified, "step: verify user response")

	var storedSessionHash string
	err = envService.db.QueryRow(context.Background(),
		`SELECT token_hash FROM sessions
			 WHERE user_id = $1 AND ip_address = $2 AND user_agent = $3
			 ORDER BY created_at DESC LIMIT 1`, user.ID, "127.0.0.1", "test_agent").Scan(&storedSessionHash)
	require.NoError(t, err, "step: fetch session")
	require.Equal(t, hash.HashFunc(rawToken), storedSessionHash, "step: token must be stored hashed")
}

func TestService_VerifyUser(t *testing.T) {
	t.Run("logs_in_with_email", func(t *testing.T) {
		logsHelper(t, true)
	})
	t.Run("logs_in_with_username", func(t *testing.T) {
		logsHelper(t, false)
	})
	t.Run("rejects_wrong_password", func(t *testing.T) {
		envService := newTestService(t)
		userCreated := createUserHelper(t, envService, uniqueEmail(t), true)
		user, rawToken, err := verifyUserHelper(envService, userCreated.Email, "fakePassword")

		require.EqualError(t, err, ErrPasswordInvalid, "step: verify user response")
		require.Empty(t, rawToken, "step: verify user response")
		require.Equal(t, httpx.UserResponse{}, user, "step: verify user response")

		count, err := envService.query.CountRecentFailedAttempts(context.Background(), sqlc.CountRecentFailedAttemptsParams{
			Email:     pgtype.Text{String: userCreated.Email, Valid: true},
			IpAddress: pgtype.Text{String: "127.0.0.1", Valid: true},
		})
		require.NoError(t, err, "step: count recent failed attempts")
		require.Equal(t, int64(1), count, "step: count recent failed attempts")

	})
	t.Run("rejects_unknown_identity", func(t *testing.T) {
		envService := newTestService(t)
		user, rawToken, err := verifyUserHelper(envService, "fakeEmail@gmail.com", "password123")

		require.EqualError(t, err, ErrIdentityInvalid, "step: verify user response")
		require.Empty(t, rawToken, "step: verify user response")
		require.Equal(t, httpx.UserResponse{}, user, "step: verify user response")

		count, err := envService.query.CountRecentFailedAttempts(context.Background(), sqlc.CountRecentFailedAttemptsParams{
			Email:     pgtype.Text{String: "fakeEmail@gmail.com", Valid: true},
			IpAddress: pgtype.Text{String: "127.0.0.1", Valid: true},
		})
		require.NoError(t, err, "step: count recent failed attempts")
		require.Equal(t, int64(1), count, "step: count recent failed attempts")

	})

	t.Run("rejects_unverified_email", func(t *testing.T) {
		envService := newTestService(t)
		userCreated := createUserHelper(t, envService, uniqueEmail(t), false)
		user, rawToken, err := verifyUserHelper(envService, userCreated.Email, "password123")
		require.EqualError(t, err, ErrEmailNotVerified, "step: verify user response")
		require.Empty(t, rawToken, "step: verify user response")
		require.Equal(t, httpx.UserResponse{Email: userCreated.Email}, user, "step: verify user response")

		count, err := envService.query.CountRecentFailedAttempts(context.Background(), sqlc.CountRecentFailedAttemptsParams{
			Email:     pgtype.Text{String: userCreated.Email, Valid: true},
			IpAddress: pgtype.Text{String: "127.0.0.1", Valid: true},
		})
		require.NoError(t, err, "step: count recent failed attempts")
		require.Equal(t, int64(1), count, "step: count recent failed attempts")

	})

	t.Run("rejects_disabled_account", func(t *testing.T) {
		envService := newTestService(t)
		userCreated := createUserHelper(t, envService, uniqueEmail(t), true)

		_, err := envService.db.Exec(context.Background(),
			`UPDATE users SET is_active = false WHERE id = $1`, userCreated.ID)
		require.NoError(t, err, "step: disable user")

		user, rawToken, err := verifyUserHelper(envService, userCreated.Email, "password123")
		require.EqualError(t, err, ErrAccountDisabled, "step: verify user response")
		require.Empty(t, rawToken, "step: verify user response")
		require.Equal(t, httpx.UserResponse{}, user, "step: verify user response")
	})

	t.Run("rejects_user_without_credential_account", func(t *testing.T) {
		envService := newTestService(t)
		email := uniqueEmail(t)

		userID := uuid.NewV7()
		_, err := envService.query.CreateUser(context.Background(), sqlc.CreateUserParams{
			ID:            userID,
			Username:      "test123",
			Email:         email,
			EmailVerified: true,
			FullName:      "test",
			DateOfBirth:   pgtype.Date{},
			LastLogin:     pgtype.Timestamptz{},
			Timezone:      pgtype.Text{},
		})
		require.NoError(t, err, "step: seed user without credential account")

		user, rawToken, err := verifyUserHelper(envService, email, "password123")
		require.EqualError(t, err, ErrIdentityInvalid, "step: verify user response")
		require.Empty(t, rawToken, "step: verify user response")
		require.Equal(t, httpx.UserResponse{}, user, "step: verify user response")
	})

	t.Run("rate_limits_after_five_failed_attempts", func(t *testing.T) {
		envService := newTestService(t)
		userCreated := createUserHelper(t, envService, uniqueEmail(t), true)

		for i := 0; i < 5; i++ {
			attemptID := uuid.NewV7()
			err := envService.query.InsertLoginAttempt(context.Background(), sqlc.InsertLoginAttemptParams{
				ID:        attemptID,
				UserID:    pgtype.UUID{},
				Email:     pgtype.Text{String: userCreated.Email, Valid: true},
				Username:  pgtype.Text{String: userCreated.Username, Valid: true},
				IpAddress: pgtype.Text{String: "127.0.0.1", Valid: true},
				Success:   false,
			})
			require.NoError(t, err, "step: seed failed login attempt %d", i)
		}

		user, rawToken, err := verifyUserHelper(envService, userCreated.Email, "password123")
		require.EqualError(t, err, ErrTooManyAttempts, "step: verify user response")
		require.Empty(t, rawToken, "step: verify user response")
		require.Equal(t, httpx.UserResponse{}, user, "step: verify user response")
	})

}

func TestService_VerifyToken(t *testing.T) {
	t.Run("verifies_email", func(t *testing.T) {
		envService := newTestService(t)
		email := uniqueEmail(t)
		userCreated := createUserHelper(t, envService, email, false)
		sent := envService.mailer.WaitForVerificationEmail(t, 5*time.Second)

		err := envService.service.VerifyToken(context.Background(), sent.RawToken, "", sqlc.TokentypeEmailVerification)
		require.NoError(t, err, "step: verify token")

		dbUser, err := envService.query.GetUserByEmailOrUsername(context.Background(), email)
		require.NoError(t, err, "step: fetch user after verification")
		require.True(t, dbUser.EmailVerified, "step: user should be email verified")

		_, err = envService.query.GetLatestUnusedToken(context.Background(), sqlc.GetLatestUnusedTokenParams{
			UserID:    dbUser.ID,
			TokenType: sqlc.TokentypeEmailVerification,
		})
		require.ErrorIs(t, err, pgx.ErrNoRows, "step: token should be consumed (deleted)")
		require.Equal(t, userCreated.ID, dbUser.ID, "step: same user")
	})

	t.Run("resets_password", func(t *testing.T) {
		envService := newTestService(t)
		email := uniqueEmail(t)
		createUserHelper(t, envService, email, true)

		err := envService.service.ForgotPassword(context.Background(), email)
		require.NoError(t, err, "step: request password reset")
		sent := envService.mailer.WaitForPasswordResetEmail(t, 5*time.Second)
		require.Equal(t, "https://test.example.comreset-password", sent.VerifyURL, "step: reset email url")

		err = envService.service.VerifyToken(context.Background(), sent.RawToken, "newPassword123", sqlc.TokentypePasswordReset)
		require.NoError(t, err, "step: reset password with token")

		_, _, err = verifyUserHelper(envService, email, "newPassword123")
		require.NoError(t, err, "step: login with new password")

		_, _, err = verifyUserHelper(envService, email, "password123")
		require.EqualError(t, err, ErrPasswordInvalid, "step: old password must not work")
	})

	t.Run("rejects_invalid_token", func(t *testing.T) {
		envService := newTestService(t)

		err := envService.service.VerifyToken(context.Background(), "bogus-token", "", sqlc.TokentypeEmailVerification)
		require.EqualError(t, err, ErrTokenNotValid, "step: verify token")
	})
}

func TestService_ResendEmailVerification(t *testing.T) {
	t.Run("sends_new_token_when_unverified", func(t *testing.T) {
		envService := newTestService(t)
		email := uniqueEmail(t)

		userID := uuid.NewV7()
		_, err := envService.query.CreateUser(context.Background(), sqlc.CreateUserParams{
			ID:            userID,
			Username:      "test123",
			Email:         email,
			EmailVerified: false,
			FullName:      "test",
			DateOfBirth:   pgtype.Date{},
			LastLogin:     pgtype.Timestamptz{},
			Timezone:      pgtype.Text{},
		})
		require.NoError(t, err, "step: seed unverified user without token")

		err = envService.service.ResendEmailVerification(context.Background(), email)
		require.NoError(t, err, "step: resend verification email")
		sent := envService.mailer.WaitForVerificationEmail(t, 5*time.Second)
		require.Equal(t, 1, envService.mailer.VerificationEmailCount(), "step: one email should be sent")
		require.Equal(t, "https://test.example.comverify-email", sent.VerifyURL, "step: verification email url")

		var storedTokenHash string
		err = envService.db.QueryRow(context.Background(),
			`SELECT token_hash FROM tokens
			 WHERE user_id = $1 AND token_type = 'email_verification'`, userID).Scan(&storedTokenHash)
		require.NoError(t, err, "step: fetch token")
		require.Equal(t, hash.HashFunc(sent.RawToken), storedTokenHash, "step: token must be stored hashed")
	})

	t.Run("silently_succeeds_for_unknown_email", func(t *testing.T) {
		envService := newTestService(t)

		err := envService.service.ResendEmailVerification(context.Background(), "nobody@example.com")
		require.NoError(t, err, "step: resend for unknown email")
		require.Equal(t, 0, envService.mailer.VerificationEmailCount(), "step: no email should be sent")
	})

	t.Run("does_nothing_when_already_verified", func(t *testing.T) {
		envService := newTestService(t)
		email := uniqueEmail(t)
		createUserHelper(t, envService, email, true)
		envService.mailer.WaitForVerificationEmail(t, 5*time.Second)

		err := envService.service.ResendEmailVerification(context.Background(), email)
		require.NoError(t, err, "step: resend for verified email")
		require.Equal(t, 1, envService.mailer.VerificationEmailCount(), "step: no new email should be sent")
	})
}

func TestService_ForgotPassword(t *testing.T) {
	t.Run("issues_password_reset_token", func(t *testing.T) {
		envService := newTestService(t)
		email := uniqueEmail(t)
		createUserHelper(t, envService, email, true)

		err := envService.service.ForgotPassword(context.Background(), email)
		require.NoError(t, err, "step: forgot password")

		sent := envService.mailer.WaitForPasswordResetEmail(t, 5*time.Second)
		require.Equal(t, "https://test.example.comreset-password", sent.VerifyURL, "step: reset email url")
		require.Equal(t, email, sent.ToEmail, "step: reset email recipient")

		dbUser, err := envService.query.GetUserByEmailOrUsername(context.Background(), email)
		require.NoError(t, err, "step: fetch user")

		var tokenCount int
		err = envService.db.QueryRow(context.Background(),
			`SELECT COUNT(*) FROM tokens
			 WHERE user_id = $1 AND token_type = 'password_reset'`, dbUser.ID).Scan(&tokenCount)
		require.NoError(t, err, "step: count reset tokens")
		require.Equal(t, 1, tokenCount, "step: one reset token should be stored")
	})

	t.Run("silently_succeeds_for_unknown_email", func(t *testing.T) {
		envService := newTestService(t)

		err := envService.service.ForgotPassword(context.Background(), "nobody@example.com")
		require.NoError(t, err, "step: forgot password for unknown email")
	})

	t.Run("rate_limits_second_request_within_60_seconds", func(t *testing.T) {
		envService := newTestService(t)
		email := uniqueEmail(t)
		createUserHelper(t, envService, email, true)

		err := envService.service.ForgotPassword(context.Background(), email)
		require.NoError(t, err, "step: first forgot password")

		err = envService.service.ForgotPassword(context.Background(), email)
		require.EqualError(t, err, ErrRateLimitExceeded, "step: second request must be rate limited")
	})
}

func TestService_DeleteSession(t *testing.T) {
	t.Run("deletes_session", func(t *testing.T) {
		envService := newTestService(t)
		email := uniqueEmail(t)
		createUserHelper(t, envService, email, true)

		_, rawToken, err := verifyUserHelper(envService, email, "password123")
		require.NoError(t, err, "step: login to create session")

		err = envService.service.DeleteSession(context.Background(), hash.HashFunc(rawToken))
		require.NoError(t, err, "step: delete session")

		_, err = envService.query.GetSessionByHash(context.Background(), hash.HashFunc(rawToken))
		require.ErrorIs(t, err, pgx.ErrNoRows, "step: session should be gone")
	})
}

func gothTestUser(email string) goth.User {
	return goth.User{
		Name:   "John Doe",
		Email:  email,
		UserID: "google-" + email,
	}
}

func TestService_CreateOAuthUser(t *testing.T) {
	t.Run("creates_user_from_goth_user", func(t *testing.T) {
		envService := newTestService(t)
		gothUser := gothTestUser(uniqueEmail(t))

		user, err := envService.service.CreateOAuthUser(context.Background(), envService.query, gothUser)
		require.NoError(t, err, "step: create oauth user")
		require.Equal(t, "John Doe", user.FullName, "step: oauth user")
		require.Equal(t, gothUser.Email, user.Email, "step: oauth user")
		require.True(t, user.EmailVerified, "step: oauth user should be verified")
		username, _ := GenerateBaseUsername(gothUser.Email)
		require.Equal(t, username, user.Username, "step: username derived from email")
	})

	t.Run("rejects_duplicate_email", func(t *testing.T) {
		envService := newTestService(t)
		gothUser := gothTestUser(uniqueEmail(t))

		_, err := envService.service.CreateOAuthUser(context.Background(), envService.query, gothUser)
		require.NoError(t, err, "step: first create must succeed")

		_, err = envService.service.CreateOAuthUser(context.Background(), envService.query, gothUser)
		require.EqualError(t, err, ErrEmailOrUserTaken, "step: duplicate oauth create must fail")
	})
}

func TestService_OAuthLogin(t *testing.T) {
	t.Run("returns_existing_user_when_account_already_linked", func(t *testing.T) {
		envService := newTestService(t)
		gothUser := gothTestUser(uniqueEmail(t))

		first, err := envService.service.OAuthLogin(context.Background(), gothUser, "google")
		require.NoError(t, err, "step: first oauth login")
		require.True(t, first.EmailVerified, "step: oauth user verified")

		second, err := envService.service.OAuthLogin(context.Background(), gothUser, "google")
		require.NoError(t, err, "step: second oauth login")
		require.Equal(t, first.ID, second.ID, "step: same user returned")
	})

	t.Run("creates_and_links_new_user", func(t *testing.T) {
		envService := newTestService(t)
		gothUser := gothTestUser(uniqueEmail(t))

		user, err := envService.service.OAuthLogin(context.Background(), gothUser, "google")
		require.NoError(t, err, "step: oauth login")
		require.Equal(t, gothUser.Email, user.Email, "step: user created with provider email")

		account, err := envService.query.GetAccountByProvider(context.Background(), sqlc.GetAccountByProviderParams{
			Provider:  "google",
			AccountID: gothUser.UserID,
		})
		require.NoError(t, err, "step: linked account should exist")
		require.Equal(t, user.ID, account.UserID, "step: account linked to created user")
	})

	t.Run("links_account_to_existing_verified_user", func(t *testing.T) {
		envService := newTestService(t)
		email := uniqueEmail(t)
		existing := createUserHelper(t, envService, email, true)
		gothUser := gothTestUser(email)

		user, err := envService.service.OAuthLogin(context.Background(), gothUser, "google")
		require.NoError(t, err, "step: oauth login")
		require.Equal(t, existing.ID, user.ID, "step: existing verified user returned")

		_, err = envService.query.GetAccountByProvider(context.Background(), sqlc.GetAccountByProviderParams{
			Provider:  "google",
			AccountID: gothUser.UserID,
		})
		require.NoError(t, err, "step: oauth account linked to existing user")
	})

	t.Run("replaces_unverified_user_with_same_email", func(t *testing.T) {
		envService := newTestService(t)
		email := uniqueEmail(t)
		zombie := createUserHelper(t, envService, email, false)
		gothUser := gothTestUser(email)

		user, err := envService.service.OAuthLogin(context.Background(), gothUser, "google")
		require.NoError(t, err, "step: oauth login")
		require.NotEqual(t, zombie.ID, user.ID, "step: fresh user should replace the unverified one")
		require.True(t, user.EmailVerified, "step: new user verified")

		dbUser, err := envService.query.GetUserByEmailOrUsername(context.Background(), email)
		require.NoError(t, err, "step: fetch user by email")
		require.Equal(t, user.ID, dbUser.ID, "step: only the fresh user remains")

		_, err = envService.query.GetUserByID(context.Background(), zombie.ID)
		require.ErrorIs(t, err, pgx.ErrNoRows, "step: old unverified user deleted")
	})

	t.Run("rejects_disabled_user", func(t *testing.T) {
		envService := newTestService(t)
		email := uniqueEmail(t)
		existing := createUserHelper(t, envService, email, true)

		_, err := envService.db.Exec(context.Background(),
			`UPDATE users SET is_active = false WHERE id = $1`, existing.ID)
		require.NoError(t, err, "step: disable user")

		_, err = envService.service.OAuthLogin(context.Background(), gothTestUser(email), "google")
		require.EqualError(t, err, ErrAccountDisabled, "step: oauth login for disabled user")
	})
}
