package oauth

import (
	"net/http"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/config"
	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/facebook"
	"github.com/markbates/goth/providers/google"
)

func Init(cfg *config.Config) {

	var (
		key    = cfg.GothSecret
		maxAge = 86400 * 30
		isProd = cfg.AppEnv == "production"
	)

	store := sessions.NewCookieStore([]byte(key))
	store.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   isProd,
		SameSite: http.SameSiteLaxMode,
	}

	gothic.Store = store

	goth.UseProviders(
		google.New(
			cfg.Google.ClientID,
			cfg.Google.Secret,
			cfg.BackendURL+"v1/auth/google/callback",
			"profile",
			"email",
		),
		facebook.New(
			cfg.Facebook.ClientID,
			cfg.Facebook.Secret,
			cfg.BackendURL+"v1/auth/facebook/callback",
		),
	)
}
