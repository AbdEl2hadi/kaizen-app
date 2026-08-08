package mail

import (
	"bytes"
	"context"
	"fmt"
	"html/template"
	"net/smtp"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/config"
)

type GmailMailer struct {
	config config.SMTPConfig
}

func NewGmailMailer(config config.SMTPConfig) *GmailMailer {
	return &GmailMailer{
		config: config,
	}
}
func (g *GmailMailer) SendVerificationEmail(ctx context.Context, verifyURL, username, toEmail, rawToken string) error {
	tmpl, err := template.ParseFS(Templates, "templates/verifyEmail.html")
	if err != nil {
		return err
	}
	ctxData := map[string]string{
		"Username":  username,
		"VerifyUrl": fmt.Sprintf("%s?token=%s", verifyURL, rawToken),
	}
	var bodyHTML bytes.Buffer
	if err := tmpl.Execute(&bodyHTML, ctxData); err != nil {
		return err
	}
	// build SMTP :
	subject := "Subject: Verify your email address\n"
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	message := []byte(subject + mime + bodyHTML.String())
	done := make(chan error, 1)
	go func() {
		auth := smtp.PlainAuth("", g.config.Username, g.config.Password, g.config.Host)
		addr := fmt.Sprintf("%s:%s", g.config.Host, g.config.Port)
		done <- smtp.SendMail(addr, auth, g.config.From, []string{toEmail}, message)
	}()

	select {
	case err := <-done:
		return err
	case <-ctx.Done():
		return fmt.Errorf("smtp timeout: %w", ctx.Err())
	}
}
func (g *GmailMailer) SendPasswordResetEmail(ctx context.Context, resetURL, username, toEmail, rawToken string) error {
	tmpl, err := template.ParseFS(Templates, "templates/resetPassword.html")
	if err != nil {
		return err
	}
	ctxData := map[string]string{
		"Username": username,
		"ResetUrl": fmt.Sprintf("%s?token=%s", resetURL, rawToken),
	}
	var bodyHTML bytes.Buffer
	if err := tmpl.Execute(&bodyHTML, ctxData); err != nil {
		return err
	}
	// build SMTP :
	subject := "Subject: Reset your password\n"
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	message := []byte(subject + mime + bodyHTML.String())
	done := make(chan error, 1)
	go func() {
		auth := smtp.PlainAuth("", g.config.Username, g.config.Password, g.config.Host)
		addr := fmt.Sprintf("%s:%s", g.config.Host, g.config.Port)
		done <- smtp.SendMail(addr, auth, g.config.From, []string{toEmail}, message)
	}()

	select {
	case err := <-done:
		return err
	case <-ctx.Done():
		return fmt.Errorf("smtp timeout: %w", ctx.Err())
	}
}
