package mail

import (
	"context"
	"sync"
	"testing"
	"time"
)

type FakeMailer struct {
	SendVerificationEmailFn  func(ctx context.Context, verifyURL, username, toEmail, rawToken string) error
	SendPasswordResetEmailFn func(ctx context.Context, resetURL, username, toEmail, rawToken string) error
}

func (f *FakeMailer) SendVerificationEmail(ctx context.Context, verifyURL, username, toEmail, rawToken string) error {
	if f.SendVerificationEmailFn == nil {
		panic("SendVerificationEmailFn called but SendVerificationEmailFn was nil")
	}

	return f.SendVerificationEmailFn(ctx, verifyURL, username, toEmail, rawToken)
}

func (f *FakeMailer) SendPasswordResetEmail(ctx context.Context, verifyURL, username, toEmail, rawToken string) error {
	if f.SendPasswordResetEmailFn == nil {
		panic("SendPasswordResetEmailFn called but SendPasswordResetEmailFn was nil")
	}

	return f.SendPasswordResetEmailFn(ctx, verifyURL, username, toEmail, rawToken)
}

type verificationEmail struct {
	VerifyURL, Username, ToEmail, RawToken string
}

type RecordingMailer struct {
	*FakeMailer
	mu            sync.Mutex
	verification  []verificationEmail
	passwordReset []verificationEmail
}

func NewRecordingMailer() *RecordingMailer {
	m := &RecordingMailer{}
	m.FakeMailer = &FakeMailer{
		SendVerificationEmailFn: func(ctx context.Context, verifyURL, username, toEmail, rawToken string) error {
			m.mu.Lock()
			defer m.mu.Unlock()
			m.verification = append(m.verification, verificationEmail{verifyURL, username, toEmail, rawToken})
			return nil
		},
		SendPasswordResetEmailFn: func(ctx context.Context, resetURL, username, toEmail, rawToken string) error {
			m.mu.Lock()
			defer m.mu.Unlock()
			m.passwordReset = append(m.passwordReset, verificationEmail{resetURL, username, toEmail, rawToken})
			return nil
		},
	}
	return m
}

func (m *RecordingMailer) WaitForVerificationEmail(t *testing.T, timeout time.Duration) verificationEmail {
	t.Helper()
	return m.waitFor(t, timeout, &m.verification, "verification email")
}

func (m *RecordingMailer) WaitForPasswordResetEmail(t *testing.T, timeout time.Duration) verificationEmail {
	t.Helper()
	return m.waitFor(t, timeout, &m.passwordReset, "password reset email")
}

func (m *RecordingMailer) VerificationEmailCount() int {
	m.mu.Lock()
	defer m.mu.Unlock()
	return len(m.verification)
}

func (m *RecordingMailer) waitFor(t *testing.T, timeout time.Duration, emails *[]verificationEmail, kind string) verificationEmail {
	t.Helper()
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		m.mu.Lock()
		if len(*emails) > 0 {
			email := (*emails)[len(*emails)-1]
			m.mu.Unlock()
			return email
		}
		m.mu.Unlock()
		time.Sleep(10 * time.Millisecond)
	}
	t.Fatalf("timed out waiting for %s", kind)
	return verificationEmail{}
}
