package mail

import (
	"context"
	"embed"
)

type Mailer interface {
	SendVerificationEmail(ctx context.Context, resetURL, username, toEmail, rawToken string) error
	SendPasswordResetEmail(ctx context.Context, resetURL, username, toEmail, rawToken string) error
}

//go:embed templates/*.html
var Templates embed.FS
