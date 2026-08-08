package auth

import "github.com/go-chi/chi/v5"

func Routes(h *Handler) chi.Router {
	r := chi.NewRouter()

	r.Post("/register", h.Register)
	r.Post("/login", h.Login)
	r.Post("/logout", h.Logout)
	r.Post("/resend-verification", h.ResendVerificationEmail)
	r.Post("/forgot-password", h.ForgotPassword)
	r.Post("/verify-email", h.VerifyEmail)
	r.Post("/reset-password", h.ResetPassword)

	// oauth Goth
	r.Get("/{provider}", h.GothLogin)
	r.Get("/{provider}/callback", h.GothCallback)

	return r
}
