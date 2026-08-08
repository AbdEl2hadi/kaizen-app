package middleware

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/Repository"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/config"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils"
)

type Middleware struct {
	query  *Repository.Queries
	config *config.Config
}

func NewMiddleware(q *Repository.Queries, cfg *config.Config) *Middleware {
	return &Middleware{
		query:  q,
		config: cfg,
	}
}

func (m Middleware) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookieName := utils.SessionCookieName("session_token", m.config.AppEnv)
		cookie, err := r.Cookie(cookieName)
		if err != nil {
			log.Printf("cookie err: %v", err)
			utils.SendError[any](w, http.StatusUnauthorized, nil, "Unauthorized: Please log in", "")
			return
		}
		rawToken := cookie.Value
		hashedToken := utils.HashFunc(rawToken)

		session, err := m.query.GetSessionByHash(r.Context(), hashedToken)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				log.Printf("no session found with hash: %s", hashedToken)
				utils.SendError[any](w, http.StatusUnauthorized, nil, "Unauthorized: Invalid session", "")
				return
			}
			log.Println(err)
			utils.SendError[any](w, http.StatusInternalServerError, nil, "Internal Server Error", "")
			return
		}

		// check if session is expired
		if time.Now().After(session.ExpiresAt.Time) {
			err := m.query.DeleteSession(r.Context(), hashedToken)
			if err != nil {
				log.Println(err)
				utils.SendError[any](w, http.StatusInternalServerError, nil, "internal server error", "")
				return
			}
			http.SetCookie(w, &http.Cookie{
				Name:     cookieName,
				Value:    "",
				Path:     "/",
				MaxAge:   -1,
				HttpOnly: true,
			})
			utils.SendError[any](w, http.StatusUnauthorized, nil, "Unauthorized: Invalid session", "")
			return
		}
		ctx := context.WithValue(r.Context(), userIDKey, session.UserID.String())
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
