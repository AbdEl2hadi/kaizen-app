package middleware

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/cache"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/cache/redis"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/db/sqlc"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils/hash"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils/httpx"
)

func (m Middleware) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookieName := httpx.SessionCookieName("session_token", m.config.AppEnv)
		cookie, err := r.Cookie(cookieName)
		if err != nil {
			log.Printf("cookie err: %v", err)
			httpx.SendError[any](w, http.StatusUnauthorized, nil, "Unauthorized: Please log in", "")
			return
		}
		rawToken := cookie.Value
		hashedToken := hash.HashFunc(rawToken)

		sessionKey := redis.SessionKey(m.config.AppEnv, hashedToken)

		sessionData, found, err := cache.Load[sqlc.GetSessionByHashRow](r.Context(), m.cache, sessionKey)

		switch {
		case err != nil:
			log.Printf("cache err: %v", err) // fall through to DB
		case found && time.Now().Before(sessionData.ExpiresAt.Time):
			ctx := context.WithValue(r.Context(), userIDKey, sessionData.UserID)
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		default:
			_ = m.cache.Delete(r.Context(), sessionKey) // miss or stale → evict, go to DB
		}

		session, err := m.query.GetSessionByHash(r.Context(), hashedToken)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				log.Printf("no session found with hash: %s", hashedToken)
				httpx.SendError[any](w, http.StatusUnauthorized, nil, "Unauthorized: Invalid session", "")
				return
			}
			log.Println(err)
			httpx.SendError[any](w, http.StatusInternalServerError, nil, "Internal Server Error", "")
			return
		}

		// check if session is expired
		if time.Now().After(session.ExpiresAt.Time) {
			err = m.query.DeleteSession(r.Context(), hashedToken)
			if err != nil {
				log.Println(err)
				httpx.SendError[any](w, http.StatusInternalServerError, nil, "internal server error", "")
				return
			}
			http.SetCookie(w, &http.Cookie{
				Name:     cookieName,
				Value:    "",
				Path:     "/",
				MaxAge:   -1,
				HttpOnly: true,
			})
			httpx.SendError[any](w, http.StatusUnauthorized, nil, "Unauthorized: Invalid session", "")
			return
		}
		if ttl := time.Until(session.ExpiresAt.Time); ttl > 0 {
			ttl = min(ttl, 2*time.Minute) // never outlive the session itself
			_ = m.cache.Set(r.Context(), sessionKey, sqlc.GetSessionByHashRow{
				UserID:    session.UserID,
				ExpiresAt: session.ExpiresAt,
			}, ttl)
		}

		ctx := context.WithValue(r.Context(), userIDKey, session.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
