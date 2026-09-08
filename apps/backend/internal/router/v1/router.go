package v1

import (
	"log"
	"net/http"
	"time"

	redisCache "github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/cache/redis"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/config"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/db/sqlc"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/mail"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/middleware"
	auth "github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/modules/auth/v1"
	habits "github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/modules/habits/v1"
	user "github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/modules/user/v1"
	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

func Router(db *pgxpool.Pool, cfg *config.Config, rdb *redis.Client) http.Handler {
	v1Router := chi.NewRouter()
	/*cache system */
	cache := redisCache.New(rdb)
	/*services*/
	authService := auth.NewService(db, cfg, mail.NewGmailMailer(cfg.SMTP), cache)
	userService := user.NewService(db, cfg, cache)
	habitService := habits.NewService(db, cfg, cache)

	/*handlers*/
	authHandler := auth.NewHandler(authService, cfg)
	userHandler := user.NewHandler(userService)
	habitsHandler := habits.NewHandler(habitService)

	/*middleware*/
	m := middleware.NewMiddleware(sqlc.New(db), cfg, cache)

	/*RATE LIMITING */
	authStore, err := middleware.NewStore(10, time.Minute)
	if err != nil {
		log.Fatal(err)
	}
	var header string
	if cfg.AppEnv == "production" {
		header = "True-Client-IP"
	}
	authRL, err := middleware.NewLimitMiddleware(authStore, header)
	if err != nil {
		log.Fatal(err)
	}

	if cfg.AppEnv == "production" {
		v1Router.Use(chiMiddleware.ClientIPFromHeader("True-Client-IP"))
	} else {
		v1Router.Use(chiMiddleware.ClientIPFromHeader("X-Real-IP"))
	}

	/*Mounts handler*/
	//public routes
	v1Router.Route("/auth", func(r chi.Router) {
		r.Use(authRL.Handle)
		r.Mount("/", auth.Routes(authHandler))
	})
	//private routes
	v1Router.Route("/api", func(r chi.Router) {
		r.Use(m.AuthMiddleware)
		r.Mount("/", user.Routes(userHandler))
		r.Mount("/habits", habits.Routes(habitsHandler))

	})
	return v1Router
}
