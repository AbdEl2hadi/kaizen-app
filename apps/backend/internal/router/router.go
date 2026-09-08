package router

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/config"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/middleware"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/router/v1"
	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

func Routes(db *pgxpool.Pool, cfg *config.Config, rdb *redis.Client) http.Handler {
	r := chi.NewRouter()

	// A good base middleware stack
	r.Use(chiMiddleware.RequestID)
	r.Use(chiMiddleware.ClientIPFromRemoteAddr)
	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)
	if cfg.AppEnv == "production" {
		r.Use(chiMiddleware.ClientIPFromHeader("True-Client-IP"))
	} else {
		r.Use(chiMiddleware.ClientIPFromRemoteAddr)
	}
	generalLimitStore, err := middleware.NewStore(100, time.Minute)
	if err != nil {
		log.Fatal(err)
	}
	var header string
	if cfg.AppEnv == "production" {
		header = "True-Client-IP"
	}
	generalLimit, err := middleware.NewLimitMiddleware(generalLimitStore, header)
	if err != nil {
		log.Fatal(err)
	}
	r.Use(generalLimit.Handle)
	// Set a timeout value on the request context (ctx), that will signal.
	// through ctx.Done() that the request has timed out and further.
	// processing should be stopped.
	r.Use(chiMiddleware.Timeout(60 * time.Second))

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"*"},
		AllowedHeaders:   []string{"*"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/health", healthCheckHandler(db))
	r.Mount("/v1", v1.Router(db, cfg, rdb))

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
