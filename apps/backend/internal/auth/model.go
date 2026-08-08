package auth

import (
	"crypto/rand"
	"math/big"
	"regexp"
	"strings"
	"time"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils"
	"github.com/go-playground/validator/v10"
)

type LoginRequest struct {
	Identity string `json:"identity" validate:"required,username_or_email"`
	Password string `json:"password" validate:"required"`
}

type SignupRequest struct {
	FullName        string     `json:"fullName" validate:"required,max=100"`
	Username        string     `json:"username" validate:"required,signup_username"`
	Email           string     `json:"email" validate:"required,email"`
	Password        string     `json:"password" validate:"required,min=8"`
	ConfirmPassword string     `json:"confirmPassword" validate:"required,eqfield=Password"`
	DateOfBirth     utils.Date `json:"dateOfBirth" validate:"required,valid_dob"`
	TimeZone        string     `json:"timeZone" validate:"required,valid_timezone"`
}
type ResendEmailVerificationRequest struct {
	Email string `json:"email" validate:"required,email"`
}
type ForgotPasswordRequest = ResendEmailVerificationRequest
type ResetPasswordRequest struct {
	Password        string `json:"password" validate:"required,min=8"`
	ConfirmPassword string `json:"confirmPassword" validate:"required,eqfield=Password"`
}

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"

var (
	emailRegex           = regexp.MustCompile(`(?i)^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$`)
	usernameStartRegex   = regexp.MustCompile(`^[a-z]`)
	usernameContentRegex = regexp.MustCompile(`^[a-z0-9._]+$`)
	usernameEndRegex     = regexp.MustCompile(`[a-z0-9]$`)
	consecutiveSpecRegex = regexp.MustCompile(`[._]{2}`)
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

func GenerateBaseUsername(email string) string {
	local := strings.Split(strings.ToLower(email), "@")[0]

	var b strings.Builder
	lastDot := false

	for _, r := range local {
		switch {
		case r >= 'a' && r <= 'z':
			b.WriteRune(r)
			lastDot = false

		case r >= '0' && r <= '9':
			b.WriteRune(r)
			lastDot = false

		case r == '.' || r == '_' || r == '-':
			if !lastDot {
				b.WriteByte('.')
				lastDot = true
			}
		}
	}

	username := b.String()

	// Must start with a letter
	for len(username) > 0 && (username[0] < 'a' || username[0] > 'z') {
		username = username[1:]
	}

	username = strings.Trim(username, "._")

	if username == "" {
		username = "user"
	}

	for len(username) < 5 {
		username += "0"
	}

	if len(username) > 20 {
		username = username[:20]
		username = strings.TrimRight(username, "._")
	}

	return username
}

func AppendRandomSuffix(base string, length int) string {
	maxBase := 20 - length
	if len(base) > maxBase {
		base = strings.TrimRight(base[:maxBase], "._")
	}

	var b strings.Builder
	b.Grow(len(base) + length)
	b.WriteString(base)

	for i := 0; i < length; i++ {
		n, _ := rand.Int(rand.Reader, big.NewInt(int64(len(alphabet))))
		b.WriteByte(alphabet[n.Int64()])
	}

	return b.String()
}

func NewValidator() *validator.Validate {
	validate := validator.New()

	// Register rule for standalone username field (Signup)
	_ = validate.RegisterValidation("signup_username", func(fl validator.FieldLevel) bool {
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
		dob, ok := fl.Field().Interface().(utils.Date)
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
