package v1

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"uuid"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/cache"
	redisCache "github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/cache/redis"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/config"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/db/sqlc"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/mail"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils/hash"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils/httpx"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/markbates/goth"
	"github.com/ravisastryk/go-safeinput"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	db           *pgxpool.Pool
	query        *sqlc.Queries
	config       *config.Config
	emailService mail.Mailer
	cache        cache.ICache
}



func NewService(db *pgxpool.Pool, cfg *config.Config, mailer mail.Mailer, c cache.ICache) *Service {
	return &Service{
		db:           db,
		config:       cfg,
		query:        sqlc.New(db),
		emailService: mailer,
		cache:        c,
	}
}

const (
	maxFailedAttempts    = 5
	maxUsernameAttempts  = 20
	maxOauthUserAttempts = 8
)


func hashPassword(password string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedBytes), nil
}
func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func generateSecureToken() (string, string, error) {
	bytes := make([]byte, 32) // 256-bit entropy
	if _, err := rand.Read(bytes); err != nil {
		return "", "", err
	}
	rawToken := hex.EncodeToString(bytes)

	// Hash the raw token using SHA-256

	hashedToken := hash.HashFunc(rawToken)

	return rawToken, hashedToken, nil
}

func (service *Service) VerifyToken(ctx context.Context, rawToken, password string, tokenType sqlc.Tokentype) error {
	hashedToken := hash.HashFunc(rawToken)

	tx, err := service.db.Begin(ctx)
	if err != nil {
		log.Printf("failed to begin transaction: %v", err)
		return err
	}
	defer tx.Rollback(ctx)
	qtx := service.query.WithTx(tx)

	userId, err := qtx.GetAndUseToken(ctx, sqlc.GetAndUseTokenParams{
		TokenType: tokenType,
		TokenHash: hashedToken,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Printf("token doesn't exist or expired  : %s", err)
			return errors.New(ErrTokenNotValid)
		}
		log.Printf("failed to get token: %v", err)
		return err
	}

	var errToken error
	switch tokenType {
	case sqlc.TokentypeEmailVerification:
		errToken = qtx.SetVerifiedEmail(ctx, sqlc.SetVerifiedEmailParams{
			EmailVerified: true,
			ID:            userId,
		})
	case sqlc.TokentypePasswordReset:
		hashedPassword, errPassword := hashPassword(password)
		if errPassword != nil {
			log.Printf("failed to hash password: %v", errPassword)
			return errPassword
		}
		errToken = qtx.SetNewPassword(ctx, sqlc.SetNewPasswordParams{
			UserID: userId,
			PasswordHash: pgtype.Text{
				String: hashedPassword,
				Valid:  true,
			},
		})
	}
	if errToken != nil {
		log.Printf("failed to %v: %v", tokenType, err)
		return errToken
	}

	if err := tx.Commit(ctx); err != nil {
		log.Printf("failed to commit transaction: %v", err)
		return err
	}
	return nil
}

func (service *Service) CreateUser(ctx context.Context, payload SignupRequest) (httpx.UserResponse, error) {
	emptyUser := httpx.UserResponse{}

	hashedPassword, err := hashPassword(payload.Password)

	if err != nil {
		log.Printf("failed to hash password: %v", err)
		return emptyUser, err
	}

	rawToken, hashedToken, err := generateSecureToken()
	if err != nil {
		log.Printf("failed to generate secure token: %v", err)
		return emptyUser, err
	}

	// safe inputs
	s := safeinput.Default()
	payload.Username = strings.TrimSpace(payload.Username)
	payload.Email = strings.ToLower(strings.TrimSpace(payload.Email))
	payload.FullName = strings.TrimSpace(payload.FullName)
	payload.FullName, err = s.Sanitize(payload.FullName, safeinput.HTMLBody)

	if err != nil {
		log.Printf("input not safe by err : %s", err)
		return emptyUser, err
	}

	// begin transaction
	tx, err := service.db.Begin(ctx)
	if err != nil {
		log.Printf("failed to begin transaction: %v", err)
		return emptyUser, err
	}
	defer tx.Rollback(ctx)
	qtx := service.query.WithTx(tx)

	userId := uuid.NewV7()

	newUser, err := qtx.CreateUser(ctx, sqlc.CreateUserParams{
		ID:            userId,
		Username:      payload.Username,
		Email:         payload.Email,
		EmailVerified: false,
		FullName:      payload.FullName,
		LastLogin: pgtype.Timestamptz{
			Time:  time.Now(),
			Valid: true,
		},
		DateOfBirth: pgtype.Date{
			Time:  payload.DateOfBirth.Time(),
			Valid: true,
		},
		Timezone: pgtype.Text{
			String: payload.TimeZone,
			Valid:  true,
		},
	})
	if err != nil {
		if pgErr, ok := errors.AsType[*pgconn.PgError](err); ok && pgErr.Code == "23505" {
			log.Printf("duplicate user constraint violation: %v", err)
			return emptyUser, errors.New(ErrEmailOrUserTaken)
		}
		log.Printf("failed to create user in database: %v", err)
		return emptyUser, err
	}
	id := uuid.NewV7()
	_, err = qtx.CreateAccount(ctx, sqlc.CreateAccountParams{
		ID:                    id,
		UserID:                userId,
		Provider:              "credential",
		AccountID:             userId.String(),
		PasswordHash:          pgtype.Text{String: hashedPassword, Valid: true},
		AccessToken:           pgtype.Text{},
		RefreshToken:          pgtype.Text{},
		AccessTokenExpiresAt:  pgtype.Timestamptz{},
		RefreshTokenExpiresAt: pgtype.Timestamptz{},
	})
	if err != nil {
		log.Printf("failed to create account in database: %v", err)
		return emptyUser, err
	}
	tokenId := uuid.NewV7()
	_, err = qtx.CreateToken(ctx, sqlc.CreateTokenParams{
		ID:        tokenId,
		UserID:    newUser.ID,
		TokenType: sqlc.TokentypeEmailVerification,
		TokenHash: hashedToken,
		ExpiresAt: pgtype.Timestamptz{
			Time:  time.Now().Add(time.Minute * 30),
			Valid: true,
		},
	})
	if err != nil {
		log.Printf("failed to create verification token: %v", err)
		return emptyUser, err
	}
	if err := tx.Commit(ctx); err != nil {
		log.Printf("failed to commit transaction: %v", err)
		return emptyUser, err
	}

	// send email verification
	go service.sendEmail(newUser.Username, newUser.Email, rawToken, sqlc.TokentypeEmailVerification)
	return httpx.UserResponse{
		ID:            newUser.ID,
		Username:      newUser.Username,
		Email:         newUser.Email,
		FullName:      newUser.FullName,
		EmailVerified: newUser.EmailVerified,
		PhoneNumber:   newUser.PhoneNumber.String,
		CreatedAt:     newUser.CreatedAt.Time.Format(time.RFC3339),
		UpdatedAt:     newUser.UpdatedAt.Time.Format(time.RFC3339),
		Image:         newUser.Image.String,
		Bio:           newUser.Bio.String,
		Timezone:      newUser.Timezone.String,
		DateOfBirth:   newUser.DateOfBirth.Time.Format(time.RFC3339),
	}, nil
}

func (service *Service) sendEmail(username, email, rawToken string, tokenType sqlc.Tokentype) {
	emailCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var err error
	if tokenType == sqlc.TokentypeEmailVerification {
		verifyURL := fmt.Sprintf("%sverify-email", service.config.FrontendURL)
		err = service.emailService.SendVerificationEmail(emailCtx, verifyURL, username, email, rawToken)
	} else {
		resetURL := fmt.Sprintf("%sreset-password", service.config.FrontendURL)
		err = service.emailService.SendPasswordResetEmail(emailCtx, resetURL, username, email, rawToken)
	}

	if err != nil {
		log.Printf("failed to send %s email: %v", tokenType, err)
	}
}

func (service *Service) VerifyUser(ctx context.Context, payload LoginRequest, ip pgtype.Text, userAgent pgtype.Text) (httpx.UserResponse, string, error) {
	identity := strings.ToLower(strings.TrimSpace(payload.Identity))
	// verify login_attempts :
	failedAttempts, err := service.query.CountRecentFailedAttempts(ctx, sqlc.CountRecentFailedAttemptsParams{
		Email: pgtype.Text{
			String: identity,
			Valid:  true,
		},
		IpAddress: ip,
	})
	if err != nil {
		log.Printf("failed to count failed attempts: %v", err)
		return httpx.UserResponse{}, "", err
	}
	if failedAttempts >= maxFailedAttempts {
		log.Printf("Too many requests IP : %s", ip.String)
		return httpx.UserResponse{}, "", errors.New(ErrTooManyAttempts)
	}

	userAccount, err := service.query.GetUserWithCredential(ctx, identity)
	if err != nil {
		_ = service.InsertLoginAttempts(ctx, nil, ip, identity, identity, false)
		if errors.Is(err, pgx.ErrNoRows) {
			return httpx.UserResponse{}, "", errors.New(ErrIdentityInvalid)
		}
		log.Printf("failed to get user with credential by email or username: %v", err)
		return httpx.UserResponse{}, "", err
	}

	if !userAccount.IsActive {
		return httpx.UserResponse{}, "", errors.New(ErrAccountDisabled)
	}

	if !checkPasswordHash(payload.Password, userAccount.PasswordHash.String) {
		_ = service.InsertLoginAttempts(ctx, &userAccount.ID, ip, userAccount.Email, userAccount.Username, false)
		return httpx.UserResponse{}, "", errors.New(ErrPasswordInvalid)
	}
	if !userAccount.EmailVerified {
		_ = service.InsertLoginAttempts(ctx, &userAccount.ID, ip, userAccount.Email, userAccount.Username, false)
		return httpx.UserResponse{
			Email: userAccount.Email,
		}, "", errors.New(ErrEmailNotVerified)
	}
	rawToken, err := service.CreateSessionForUser(ctx, userAccount.ID, ip, userAgent)
	if err != nil {
		log.Printf("failed to create session: %v", err)
		return httpx.UserResponse{}, "", err
	}
	_ = service.InsertLoginAttempts(ctx, &userAccount.ID, ip, userAccount.Email, userAccount.Username, true)
	return httpx.UserResponse{
			ID:            userAccount.ID,
			Username:      userAccount.Username,
			Email:         userAccount.Email,
			FullName:      userAccount.FullName,
			EmailVerified: userAccount.EmailVerified,
			PhoneNumber:   userAccount.PhoneNumber.String,
			Timezone:      userAccount.Timezone.String,
			DateOfBirth:   userAccount.DateOfBirth.Time.Format(time.RFC3339),
			Bio:           userAccount.Bio.String,
			CreatedAt:     userAccount.CreatedAt.Time.Format(time.RFC3339),
			UpdatedAt:     userAccount.UpdatedAt.Time.Format(time.RFC3339),
			Image:         userAccount.Image.String,
		},
		rawToken, nil
}

func (service *Service) InsertLoginAttempts(ctx context.Context, userId *uuid.UUID, ip pgtype.Text, email string, username string, success bool) error {
	id := uuid.NewV7()

	var userIDBytes uuid.UUID
	if userId != nil {
		userIDBytes = *userId
	}

	return service.query.InsertLoginAttempt(ctx, sqlc.InsertLoginAttemptParams{
		ID: id,
		UserID: pgtype.UUID{
			Bytes: userIDBytes,
			Valid: userId != nil,
		},
		IpAddress: ip,
		Email: pgtype.Text{
			String: email,
			Valid:  true,
		},
		Username: pgtype.Text{
			String: username,
			Valid:  true,
		},
		Success: success,
	})
}

func (service *Service) ResendEmailVerification(ctx context.Context, email string) error {

	user, err := service.query.GetUserByEmailOrUsername(ctx, email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			// SECURITY: Silent Success. Do not leak that the email doesn't exist.
			log.Printf("user doesn't exist or Invalid inputs")
			return nil
		}
		log.Printf("failed to get user by email or username: %v", err)
		return err
	}
	if user.EmailVerified {
		log.Printf("email already verified")
		return nil
	}

	return service.issueEmailToken(ctx, user, sqlc.TokentypeEmailVerification)
}

func (service *Service) ForgotPassword(ctx context.Context, email string) error {
	user, err := service.query.GetUserByEmailOrUsername(ctx, email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			// SECURITY: Silent Success. Do not leak that the email doesn't exist.
			log.Printf("user doesn't exist or Invalid inputs")
			return nil
		}
		log.Printf("failed to get user by email or username: %v", err)
		return err
	}
	return service.issueEmailToken(ctx, user, sqlc.TokentypePasswordReset)
}

func (service *Service) issueEmailToken(ctx context.Context, user sqlc.User, tokenType sqlc.Tokentype) error {
	latestToken, err := service.query.GetLatestUnusedToken(ctx, sqlc.GetLatestUnusedTokenParams{
		UserID:    user.ID,
		TokenType: tokenType,
	})
	if err == nil && time.Since(latestToken.CreatedAt.Time) < 60*time.Second {
		return errors.New(ErrRateLimitExceeded)
	}
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		log.Printf("failed to get latest token: %v", err)
		return err
	}

	rawToken, hashedToken, err := generateSecureToken()
	if err != nil {
		return err
	}

	tx, err := service.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	qtx := service.query.WithTx(tx)

	err = qtx.DeleteUnusedTokensForUser(ctx, sqlc.DeleteUnusedTokensForUserParams{
		UserID:    user.ID,
		TokenType: tokenType,
	})
	if err != nil {
		return err
	}

	tokenId := uuid.NewV7()
	_, err = qtx.CreateToken(ctx, sqlc.CreateTokenParams{
		ID:        tokenId,
		UserID:    user.ID,
		TokenType: tokenType,
		TokenHash: hashedToken,
		ExpiresAt: pgtype.Timestamptz{
			Time:  time.Now().Add(30 * time.Minute),
			Valid: true,
		},
	})
	if err != nil {
		return err
	}
	if err := tx.Commit(ctx); err != nil {
		return err
	}

	go service.sendEmail(user.Username, user.Email, rawToken, tokenType)
	return nil
}

func (service *Service) CreateSessionForUser(ctx context.Context, userID uuid.UUID, ip, userAgent pgtype.Text) (string, error) {
	rawToken, hashedToken, err := generateSecureToken()
	if err != nil {
		log.Printf("failed to generate secure token: %v", err)
		return "", err
	}

	sessionId := uuid.NewV7()

	expiresAt := pgtype.Timestamptz{
		Time:  time.Now().Add(7 * 24 * time.Hour),
		Valid: true,
	}

	tx, err := service.db.Begin(ctx)
	if err != nil {
		log.Printf("failed to begin transaction: %v", err)
		return "", err
	}
	defer tx.Rollback(ctx)
	qtx := service.query.WithTx(tx)

	err = qtx.CreateSession(ctx, sqlc.CreateSessionParams{
		ID:        sessionId,
		UserID:    userID,
		IpAddress: ip,
		UserAgent: userAgent,
		TokenHash: hashedToken,
		ExpiresAt: expiresAt,
	})
	if err != nil {
		log.Printf("failed to create session: %v", err)
		return "", err
	}

	err = qtx.UpdateLastLogin(ctx, userID)
	if err != nil {
		log.Printf("failed to update last login: %v", err)
		return "", err
	}
	if err := tx.Commit(ctx); err != nil {
		log.Printf("failed to commit transaction: %v", err)
		return "", err
	}

	return rawToken, nil
}

func (service *Service) DeleteSession(ctx context.Context, tokenHash string) error {
	if err := service.query.DeleteSession(ctx, tokenHash); err != nil {
		return err
	}
	_ = service.cache.Delete(ctx, redisCache.SessionKey(service.config.AppEnv, tokenHash))
	return nil
}

// oauth :

func (service *Service) CreateOAuthUser(ctx context.Context, qtx *sqlc.Queries, gothUser goth.User) (sqlc.User, error) {
	emptyUser := sqlc.User{}

	// safe-input sanitize of full name
	s := safeinput.Default()
	fullName, err := s.Sanitize(gothUser.Name, safeinput.HTMLBody)
	if err != nil {
		log.Printf("input not safe by err : %s", err)
		return emptyUser, err
	}

	email := strings.ToLower(strings.TrimSpace(gothUser.Email))
	baseUsername, err := GenerateBaseUsername(email)
	if err != nil {
		log.Printf("failed to generate base username: %v", err)
		return emptyUser, err
	}

	for attempt := 0; attempt < maxUsernameAttempts; attempt++ {
		username := baseUsername
		var errR error
		if attempt > 0 {
			username, errR = AppendRandomSuffix(baseUsername, 4)
			if errR != nil {
				log.Printf("failed to append random username: %v", err)
				return emptyUser, err
			}
		}

		user, errC := qtx.CreateUser(ctx, sqlc.CreateUserParams{
			ID:       uuid.NewV7(),
			Username: username,
			Email:    email,
			FullName: fullName,

			EmailVerified: true,

			LastLogin: pgtype.Timestamptz{
				Time:  time.Now(),
				Valid: true,
			},

			DateOfBirth: pgtype.Date{},
			Timezone:    pgtype.Text{},
		})

		if errC == nil {
			return user, nil
		}

		pgErr, ok := errors.AsType[*pgconn.PgError](errC)
		if !ok {
			return emptyUser, errC
		}

		switch pgErr.ConstraintName {

		case "users_username_unique":
			// Username is taken.
			// Generate another one and retry.
			continue

		case "users_email_unique":
			// This email already belongs to an account.
			return emptyUser, errors.New(ErrEmailOrUserTaken)

		default:
			log.Printf(
				"failed to create OAuth user: constraint=%s error=%v",
				pgErr.ConstraintName,
				errC,
			)

			return emptyUser, errC
		}
	}

	return emptyUser, errors.New("failed to generate unique username")
}
func (service *Service) linkOAuthAccount(ctx context.Context, qtx *sqlc.Queries, userID uuid.UUID, gothUser goth.User, provider string) error {
	id := uuid.NewV7()
	_, err := qtx.CreateAccount(ctx, sqlc.CreateAccountParams{
		ID:                    id,
		UserID:                userID,
		Provider:              provider,
		AccountID:             gothUser.UserID,
		PasswordHash:          pgtype.Text{},        // NULL
		AccessToken:           pgtype.Text{},        // NULL
		AccessTokenExpiresAt:  pgtype.Timestamptz{}, // NULL
		RefreshToken:          pgtype.Text{},        // NULL
		RefreshTokenExpiresAt: pgtype.Timestamptz{}, // NULL
	})
	if err != nil {
		// 23505 =  already linked;
		if pgErr, ok := errors.AsType[*pgconn.PgError](err); ok && pgErr.Code == "23505" {
			return nil
		}
		log.Printf("failed to create oauth account: %v", err)
		return err
	}
	return nil
}
func (service *Service) OAuthLogin(ctx context.Context, gothUser goth.User, provider string) (sqlc.User, error) {
	emptyUser := sqlc.User{}

	// 1. already-linked provider identity
	oa, err := service.query.GetAccountByProvider(ctx, sqlc.GetAccountByProviderParams{
		Provider:  provider,
		AccountID: gothUser.UserID,
	})
	if err == nil {
		user, err := service.query.GetUserByID(ctx, oa.UserID)
		if err != nil {
			return emptyUser, err
		}
		if !user.IsActive {
			return emptyUser, errors.New(ErrAccountDisabled)
		}
		return user, nil
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		log.Printf("failed to look up oauth account: %v", err)
		return emptyUser, err
	}

	tx, err := service.db.Begin(ctx)
	if err != nil {
		log.Printf("failed to begin transaction: %v", err)
		return emptyUser, err
	}
	defer tx.Rollback(ctx)

	qtx := service.query.WithTx(tx)

	// 2/3. check for an existing user with the same email
	email := strings.ToLower(gothUser.Email)
	existing, err := qtx.GetUserByEmailOrUsername(ctx, email)

	switch {
	case err == nil && !existing.IsActive:
		log.Printf("the user is blocked or banned %v", err)
		return emptyUser, errors.New(ErrAccountDisabled)
	case err == nil && existing.EmailVerified:
		if linkErr := service.linkOAuthAccount(ctx, qtx, existing.ID, gothUser, provider); linkErr != nil {
			return emptyUser, linkErr
		}
		if err := tx.Commit(ctx); err != nil {
			log.Printf("failed to commit transaction: %v", err)
			return emptyUser, err
		}
		return existing, nil

	case err == nil && !existing.EmailVerified:
		// pre-hijacking protection: unverified account is a zombie nobody could
		// log into (credential login blocks unverified) — delete and recreate fresh
		if err := qtx.DeleteUser(ctx, existing.ID); err != nil {
			log.Printf("failed to delete unverified user %s: %v", existing.ID, err)
			return emptyUser, err
		}
		log.Printf("oauth takeover: deleted unverified user %s (%s), creating fresh account", existing.ID, email)
		return service.createAndLinkOAuthUser(ctx, tx, qtx, gothUser, provider)

	case errors.Is(err, pgx.ErrNoRows):
		return service.createAndLinkOAuthUser(ctx, tx, qtx, gothUser, provider)

	default:
		log.Printf("failed to look up user by email: %v", err)
		return emptyUser, err
	}
}

func (service *Service) createAndLinkOAuthUser(ctx context.Context, tx pgx.Tx, qtx *sqlc.Queries, gothUser goth.User, provider string) (sqlc.User, error) {
	emptyUser := sqlc.User{}

	newUser, err := service.CreateOAuthUser(ctx, qtx, gothUser)
	if err != nil {
		if pgErr, ok := errors.AsType[*pgconn.PgError](err); ok && pgErr.Code == "23505" {
			// duplicate email: a twin callback (same identity) raced in —
			// rollback the aborted tx, then return the winner's user
			_ = tx.Rollback(ctx)

			for attempt := 0; attempt < maxOauthUserAttempts; attempt++ {
				if attempt > 1 {
					log.Printf("oauth race poll attempt=%d provider=%s account=%s", attempt, provider, gothUser.UserID)
				}
				oa, lookupErr := service.query.GetAccountByProvider(ctx, sqlc.GetAccountByProviderParams{
					Provider:  provider,
					AccountID: gothUser.UserID,
				})
				if lookupErr == nil {
					return service.query.GetUserByID(ctx, oa.UserID)
				}
				// winner's commit may not be visible yet — poll briefly
				select {
				case <-ctx.Done():
					return emptyUser, ctx.Err()
				case <-time.After(50 * time.Millisecond):
				}
			}
			// no linked account found: a concurrent credential signup won the
			// email instead → genuine conflict
			return emptyUser, errors.New(ErrEmailOrUserTaken)
		}
		log.Printf("failed to create oauth user: %v", err)
		return emptyUser, err
	}

	if linkErr := service.linkOAuthAccount(ctx, qtx, newUser.ID, gothUser, provider); linkErr != nil {
		return emptyUser, linkErr
	}

	if err := tx.Commit(ctx); err != nil {
		log.Printf("failed to commit transaction: %v", err)
		return emptyUser, err
	}
	return newUser, nil
}
