package auth

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/Repository"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/config"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/mail"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils"
	"github.com/google/uuid"
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
	query        *Repository.Queries
	config       *config.Config
	emailService *mail.GmailMailer
}

const maxFailedAttempts = 5

func NewService(db *pgxpool.Pool, cfg *config.Config) *Service {
	return &Service{
		db:           db,
		config:       cfg,
		query:        Repository.New(db),
		emailService: mail.NewGmailMailer(cfg.SMTP),
	}
}

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

	hashedToken := utils.HashFunc(rawToken)

	return rawToken, hashedToken, nil
}
func (service *Service) verifyTokenEmail(ctx context.Context, rawToken string) error {

	hashedToken := utils.HashFunc(rawToken)

	tx, err := service.db.Begin(ctx)
	if err != nil {
		log.Printf("failed to begin transaction: %v", err)
		return err
	}
	defer tx.Rollback(ctx)
	qtx := service.query.WithTx(tx)

	userId, err := qtx.GetAndUseToken(ctx, Repository.GetAndUseTokenParams{
		TokenType: Repository.TokentypeEmailVerification,
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
	err = qtx.SetVerifiedEmail(ctx, Repository.SetVerifiedEmailParams{
		EmailVerified: true,
		ID:            userId,
	})
	if err != nil {
		log.Printf("failed to set verified email: %v", err)
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		log.Printf("failed to commit transaction: %v", err)
		return err
	}
	return nil
}
func (service *Service) VerifyTokenPassword(ctx context.Context, rawToken, password string) error {
	hashedToken := utils.HashFunc(rawToken)

	tx, err := service.db.Begin(ctx)
	if err != nil {
		log.Printf("failed to begin transaction: %v", err)
		return err
	}
	defer tx.Rollback(ctx)
	qtx := service.query.WithTx(tx)

	userId, err := qtx.GetAndUseToken(ctx, Repository.GetAndUseTokenParams{
		TokenType: Repository.TokentypePasswordReset,
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
	hashedPassword, err := hashPassword(password)
	if err != nil {
		log.Printf("failed to hash password: %v", err)
		return err
	}
	err = qtx.SetNewPassword(ctx, Repository.SetNewPasswordParams{
		UserID: userId,
		PasswordHash: pgtype.Text{
			String: hashedPassword,
			Valid:  true,
		},
	})
	if err != nil {
		log.Printf("failed to set new password: %v", err)
		return err
	}

	err = qtx.DeleteSessionsForUser(ctx, userId)
	if err != nil {
		log.Printf("failed to delete sessions: %v", err)
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		log.Printf("failed to commit transaction: %v", err)
		return err
	}
	return nil
}

func (service *Service) CreateUser(ctx context.Context, payload SignupRequest) (utils.UserResponse, error) {
	emptyUser := utils.UserResponse{}

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

	userId, err := uuid.NewV7()
	if err != nil {
		log.Printf("failed to generate user ID: %v", err)
		return emptyUser, err
	}

	newUser, err := qtx.CreateUser(ctx, Repository.CreateUserParams{
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
	id, err := uuid.NewV7()
	if err != nil {
		log.Printf("failed to generate user ID: %v", err)
		return emptyUser, err
	}
	_, err = qtx.CreateAccount(ctx, Repository.CreateAccountParams{
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
	tokenId, err := uuid.NewV7()
	if err != nil {
		log.Printf("failed to generate token ID: %v", err)
		return emptyUser, err
	}
	_, err = qtx.CreateToken(ctx, Repository.CreateTokenParams{
		ID:        tokenId,
		UserID:    newUser.ID,
		TokenType: Repository.TokentypeEmailVerification,
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
	go service.sendEmail(newUser.Username, newUser.Email, rawToken, Repository.TokentypeEmailVerification)
	return utils.UserResponse{
		ID:            newUser.ID.String(),
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

func (service *Service) sendEmail(username, email, rawToken string, tokenType Repository.Tokentype) {
	emailCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var err error
	if tokenType == Repository.TokentypeEmailVerification {
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

func (service *Service) VerifyUser(ctx context.Context, payload LoginRequest, ip pgtype.Text, userAgent pgtype.Text) (utils.UserResponse, string, error) {
	identity := strings.ToLower(strings.TrimSpace(payload.Identity))
	// verify login_attempts :
	failedAttempts, err := service.query.CountRecentFailedAttempts(ctx, Repository.CountRecentFailedAttemptsParams{
		Email: pgtype.Text{
			String: identity,
			Valid:  true,
		},
		IpAddress: ip,
	})
	if err != nil {
		log.Printf("failed to count failed attempts: %v", err)
		return utils.UserResponse{}, "", err
	}
	if failedAttempts >= maxFailedAttempts {
		log.Printf("Too many requests IP : %s", ip.String)
		return utils.UserResponse{}, "", errors.New(ErrTooManyAttempts)
	}

	user, err := service.query.GetUserByEmailOrUsername(ctx, identity)
	if err != nil {
		_ = service.InsertLoginAttempts(ctx, uuid.UUID{}, ip, identity, identity, false)
		if errors.Is(err, pgx.ErrNoRows) {
			return utils.UserResponse{}, "", errors.New(ErrIdentityInvalid)
		}
		log.Printf("failed to get user by email or username: %v", err)
		return utils.UserResponse{}, "", err
	}
	if !user.IsActive {
		return utils.UserResponse{}, "", errors.New(ErrAccountDisabled)
	}

	credentialAccount, err := service.query.GetAccountByProvider(ctx, Repository.GetAccountByProviderParams{
		Provider:  "credential",
		AccountID: user.ID.String(),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return utils.UserResponse{}, "", errors.New(ErrIdentityInvalid)
		}
		log.Printf("failed to get account by provider: %v", err)
		return utils.UserResponse{}, "", err
	}
	if !checkPasswordHash(payload.Password, credentialAccount.PasswordHash.String) {
		_ = service.InsertLoginAttempts(ctx, user.ID, ip, user.Email, user.Username, false)
		return utils.UserResponse{}, "", errors.New(ErrPasswordInvalid)
	}
	if !user.EmailVerified {
		_ = service.InsertLoginAttempts(ctx, user.ID, ip, user.Email, user.Username, false)
		return utils.UserResponse{
			Email: user.Email,
		}, "", errors.New(ErrEmailNotVerified)
	}
	rawToken, err := service.CreateSessionForUser(ctx, user.ID, ip, userAgent)
	if err != nil {
		log.Printf("failed to create session: %v", err)
		return utils.UserResponse{}, "", err
	}
	_ = service.InsertLoginAttempts(ctx, user.ID, ip, user.Email, user.Username, true)
	return utils.UserResponse{
			ID:            user.ID.String(),
			Username:      user.Username,
			Email:         user.Email,
			FullName:      user.FullName,
			EmailVerified: user.EmailVerified,
			PhoneNumber:   user.PhoneNumber.String,
			Timezone:      user.Timezone.String,
			DateOfBirth:   user.DateOfBirth.Time.Format(time.RFC3339),
			Bio:           user.Bio.String,
			CreatedAt:     user.CreatedAt.Time.Format(time.RFC3339),
			UpdatedAt:     user.UpdatedAt.Time.Format(time.RFC3339),
			Image:         user.Image.String,
		},
		rawToken, nil
}

func (service *Service) InsertLoginAttempts(ctx context.Context, userId uuid.UUID, ip pgtype.Text, email string, username string, success bool) error {
	id, err := uuid.NewV7()
	if err != nil {
		log.Printf("failed to generate login attempts ID: %v", err)
		return err
	}
	return service.query.InsertLoginAttempt(ctx, Repository.InsertLoginAttemptParams{
		ID: id,
		UserID: pgtype.UUID{
			Bytes: userId,
			Valid: true,
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

	return service.issueEmailToken(ctx, user, Repository.TokentypeEmailVerification)
}

func (service *Service) sendEmailResetPassword(ctx context.Context, email string) error {
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
	return service.issueEmailToken(ctx, user, Repository.TokentypePasswordReset)
}

func (service *Service) issueEmailToken(ctx context.Context, user Repository.User, tokenType Repository.Tokentype) error {
	latestToken, err := service.query.GetLatestUnusedToken(ctx, Repository.GetLatestUnusedTokenParams{
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

	err = qtx.DeleteUnusedTokensForUser(ctx, Repository.DeleteUnusedTokensForUserParams{
		UserID:    user.ID,
		TokenType: tokenType,
	})
	if err != nil {
		return err
	}

	tokenId, err := uuid.NewV7()
	if err != nil {
		return err
	}
	_, err = qtx.CreateToken(ctx, Repository.CreateTokenParams{
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

	sessionId, err := uuid.NewV7()
	if err != nil {
		log.Printf("failed to generate session ID: %v", err)
		return "", err
	}

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

	err = qtx.CreateSession(ctx, Repository.CreateSessionParams{
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
	return service.query.DeleteSession(ctx, tokenHash)
}

// oauth :

func (service *Service) CreateOAuthUser(ctx context.Context, qtx *Repository.Queries, gothUser goth.User) (Repository.User, error) {
	emptyUser := Repository.User{}

	// safe-input sanitize of full name
	s := safeinput.Default()
	fullName, err := s.Sanitize(gothUser.Name, safeinput.HTMLBody)
	if err != nil {
		log.Printf("input not safe by err : %s", err)
		return emptyUser, err
	}

	// get username from email
	base := GenerateBaseUsername(gothUser.Email)
	for {
		usernameExist, err := qtx.IsUsernameExist(ctx, base)
		if err != nil {
			log.Printf("failed to check if username exists: %v", err)
			return emptyUser, err
		}

		if !usernameExist {
			break
		}

		base = AppendRandomSuffix(base, 2)
	}
	username := base
	userId, err := uuid.NewV7()
	if err != nil {
		log.Printf("failed to generate user ID: %v", err)
		return emptyUser, err
	}

	newUser, err := qtx.CreateUser(ctx, Repository.CreateUserParams{
		ID:            userId,
		Username:      username,
		Email:         strings.ToLower(gothUser.Email),
		FullName:      fullName,
		EmailVerified: true,
		LastLogin: pgtype.Timestamptz{
			Time:  time.Now(),
			Valid: true,
		},
		DateOfBirth: pgtype.Date{},
		Timezone:    pgtype.Text{},
	})
	if err != nil {
		if pgErr, ok := errors.AsType[*pgconn.PgError](err); ok && pgErr.Code == "23505" {
			log.Printf("duplicate user constraint violation: %v", err)
			return emptyUser, errors.New(ErrEmailOrUserTaken)
		}
		log.Printf("failed to create user in database: %v", err)
		return emptyUser, err
	}

	return newUser, nil
}
func (service *Service) linkOAuthAccount(ctx context.Context, qtx *Repository.Queries, userID uuid.UUID, gothUser goth.User, provider string) error {
	id, err := uuid.NewV7()
	if err != nil {
		log.Printf("failed to generate oauth account ID: %v", err)
		return err
	}
	_, err = qtx.CreateAccount(ctx, Repository.CreateAccountParams{
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
func (service *Service) OAuthLogin(ctx context.Context, gothUser goth.User, provider string) (Repository.User, error) {
	emptyUser := Repository.User{}

	// 1. already-linked provider identity
	oa, err := service.query.GetAccountByProvider(ctx, Repository.GetAccountByProviderParams{
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

func (service *Service) createAndLinkOAuthUser(ctx context.Context, tx pgx.Tx, qtx *Repository.Queries, gothUser goth.User, provider string) (Repository.User, error) {
	emptyUser := Repository.User{}

	newUser, err := service.CreateOAuthUser(ctx, qtx, gothUser)
	if err != nil {
		if pgErr, ok := errors.AsType[*pgconn.PgError](err); ok && pgErr.Code == "23505" {
			// duplicate email: a twin callback (same identity) raced in —
			// rollback the aborted tx, then return the winner's user
			_ = tx.Rollback(ctx)

			for attempt := 0; attempt < 5; attempt++ {
				oa, lookupErr := service.query.GetAccountByProvider(ctx, Repository.GetAccountByProviderParams{
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
				case <-time.After(100 * time.Millisecond):
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
