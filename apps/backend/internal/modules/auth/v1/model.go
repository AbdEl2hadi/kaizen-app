package v1

import (
	"context"
	"crypto/rand"
	"errors"
	"math/big"
	randV2 "math/rand/v2"
	"regexp"
	"strconv"
	"strings"
	"time"

	"uuid"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/db/sqlc"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils/date"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils/httpx"
	"github.com/go-playground/validator/v10"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/markbates/goth"
)

// interfaces

type IAuthService interface {
	CreateUser(ctx context.Context, payload SignupRequest) (httpx.UserResponse, error)
	VerifyUser(ctx context.Context, payload LoginRequest, ip pgtype.Text, userAgent pgtype.Text) (httpx.UserResponse, string, error)
	InsertLoginAttempts(ctx context.Context, userId *uuid.UUID, ip pgtype.Text, email string, username string, success bool) error
	ResendEmailVerification(ctx context.Context, email string) error
	VerifyToken(ctx context.Context, rawToken, password string, tokenType sqlc.Tokentype) error
	ForgotPassword(ctx context.Context, email string) error
	CreateSessionForUser(ctx context.Context, userID uuid.UUID, ip, userAgent pgtype.Text) (string, error)
	DeleteSession(ctx context.Context, tokenHash string) error
	CreateOAuthUser(ctx context.Context, qtx *sqlc.Queries, gothUser goth.User) (sqlc.User, error)
	OAuthLogin(ctx context.Context, gothUser goth.User, provider string) (sqlc.User, error)
}

type LoginRequest struct {
	Identity string `json:"identity" validate:"required,username_or_email"`
	Password string `json:"password" validate:"required"`
}

type SignupRequest struct {
	FullName        string    `json:"fullName" validate:"required,max=100"`
	Username        string    `json:"username" validate:"required,username"`
	Email           string    `json:"email" validate:"required,email"`
	Password        string    `json:"password" validate:"required,min=8"`
	ConfirmPassword string    `json:"confirmPassword" validate:"required,eqfield=Password"`
	DateOfBirth     date.Date `json:"dateOfBirth" validate:"required,valid_dob"`
	TimeZone        string    `json:"timeZone" validate:"required,valid_timezone"`
}
type ResendEmailVerificationRequest struct {
	Email string `json:"email" validate:"required,email"`
}
type ForgotPasswordRequest = ResendEmailVerificationRequest
type ResetPasswordRequest struct {
	Password        string `json:"password" validate:"required,min=8"`
	ConfirmPassword string `json:"confirmPassword" validate:"required,eqfield=Password"`
}

const (
	maxUsernameLength = 20
	usernameSeparator = '_'
	alphabet          = "abcdefghijklmnopqrstuvwxyz0123456789"
)

var (
	emailRegex           = regexp.MustCompile(`(?i)^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$`)
	usernameStartRegex   = regexp.MustCompile(`^[a-z]`)
	usernameContentRegex = regexp.MustCompile(`^[a-z0-9._]+$`)
	usernameEndRegex     = regexp.MustCompile(`[a-z0-9]$`)
	consecutiveSpecRegex = regexp.MustCompile(`[._]{3}`)
)

func isValidUsername(val string) bool {
	if len(val) < 5 || len(val) > 20 {
		return false
	}
	if !usernameStartRegex.MatchString(val) {
		return false
	}
	if !usernameContentRegex.MatchString(val) {
		return false
	}
	if consecutiveSpecRegex.MatchString(val) {
		return false
	}
	if !usernameEndRegex.MatchString(val) {
		return false
	}
	return true
}

func GenerateBaseUsername(email string) (string, error) {
	local, _, ok := strings.Cut(strings.ToLower(email), "@")
	if !ok {
		return "", errors.New("invalid email")
	}

	username := usernameNormalization(local)

	if username == "" {
		return "", errors.New("cannot generate username from email")
	}

	for len(username) < 5 {
		username += strconv.Itoa(randV2.IntN(10))
	}

	if len(username) > 20 {
		username = username[:20]
		username = strings.TrimRight(username, "._")
	}

	return username, nil
}

func usernameNormalization(username string) string {
	username = strings.ToLower(username)

	var b strings.Builder
	b.Grow(len(username))

	for _, r := range username {
		switch {
		case r >= 'a' && r <= 'z':
			b.WriteByte(byte(r))

		case r >= '0' && r <= '9':
			if b.Len() == 0 {
				continue
			}
			b.WriteByte(byte(r))

		case r == '.' || r == '_':
			// Can't start with a special character.
			if b.Len() == 0 {
				continue
			}
			b.WriteByte(byte(r))
		}
	}

	// Username cannot end with '.' or '_'.
	return strings.TrimRight(b.String(), "._")
}

func AppendRandomSuffix(base string, length int) (string, error) {
	// We need room for "_" + suffix.
	maxBaseLength := maxUsernameLength - 1 - length

	if maxBaseLength < 1 {
		return "", errors.New("suffix length too large")
	}

	if len(base) > maxBaseLength {
		base = strings.TrimRight(base[:maxBaseLength], "._")
	}

	var b strings.Builder
	b.Grow(len(base) + 1 + length)

	b.WriteString(base)
	b.WriteByte(usernameSeparator)

	for i := 0; i < length; i++ {
		n, err := rand.Int(
			rand.Reader,
			big.NewInt(int64(len(alphabet))),
		)
		if err != nil {
			return "", err
		}

		b.WriteByte(alphabet[n.Int64()])
	}

	return b.String(), nil
}

func NewValidator() *validator.Validate {
	validate := validator.New()

	// Register rule for standalone username field (Signup)
	_ = validate.RegisterValidation("username", func(fl validator.FieldLevel) bool {
		isValid := isValidUsername(fl.Field().String()) // Discard the string during check step
		return isValid
	})

	// Register rule for unified login identity field (Login)
	_ = validate.RegisterValidation("username_or_email", func(fl validator.FieldLevel) bool {
		value := fl.Field().String()

		if strings.Contains(value, "@") {
			return emailRegex.MatchString(value)
		}

		isValid := isValidUsername(value)
		return isValid
	})
	_ = validate.RegisterValidation("valid_dob", func(fl validator.FieldLevel) bool {
		dob, ok := fl.Field().Interface().(date.Date)
		if !ok {
			return false
		}
		if dob.Time().After(time.Now()) {
			return false // can't be born in the future
		}
		minAge := time.Now().AddDate(-13, 0, 0) // must be at least 13
		return dob.Time().Before(minAge)
	})

	_ = validate.RegisterValidation("valid_timezone", func(fl validator.FieldLevel) bool {
		tz := fl.Field().String()
		if tz == "" {
			return false
		}
		_, err := time.LoadLocation(tz)
		return err == nil
	})

	return validate
}
