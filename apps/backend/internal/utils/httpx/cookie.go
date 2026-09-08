package httpx

import (
	"fmt"
	"net/http"
	"time"
)

func SessionCookieName(name, appEnv string) string {
	if appEnv == "production" {
		return fmt.Sprintf("__Host-%v", name)
	}
	return name
}

func SetCookie(w http.ResponseWriter, name, value, appEnv string) {

	http.SetCookie(w, &http.Cookie{
		Name:     SessionCookieName(name, appEnv),
		Value:    value,
		Path:     "/",
		HttpOnly: true,
		Secure:   appEnv == "production",
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(7 * 24 * time.Hour),
		MaxAge:   7 * 24 * 3600,
	})
}
