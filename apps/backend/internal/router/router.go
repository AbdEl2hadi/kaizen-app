package router

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/config"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/rateLimit"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/router/v1"
)

func Routes(db *pgxpool.Pool, cfg *config.Config) http.Handler {
	r := chi.NewRouter()

	// A good base middleware stack
	r.Use(middleware.RequestID)
	r.Use(middleware.ClientIPFromRemoteAddr)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	if cfg.AppEnv == "production" {
		r.Use(middleware.ClientIPFromHeader("True-Client-IP"))
	} else {
		r.Use(middleware.ClientIPFromRemoteAddr)
	}
	generalLimitStore, err := rateLimit.NewStore(100, time.Minute)
	if err != nil {
		log.Fatal(err)
	}
	var header string
	if cfg.AppEnv == "production" {
		header = "True-Client-IP"
	}
	generalLimit, err := rateLimit.NewLimitMiddleware(generalLimitStore, header)
	if err != nil {
		log.Fatal(err)
	}
	r.Use(generalLimit.Handle)
	// Set a timeout value on the request context (ctx), that will signal.
	// through ctx.Done() that the request has timed out and further.
	// processing should be stopped.
	r.Use(middleware.Timeout(60 * time.Second))

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"*"},
		AllowedHeaders:   []string{"*"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/health", healthCheckHandler(db))
	r.Mount("/v1", v1.Router(db, cfg))

	return r
}

func healthCheckHandler(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()

		if err := db.Ping(ctx); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte(`{"status":"unhealthy"}`))
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	}
}
