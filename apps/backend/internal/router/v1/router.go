package v1

import (
	"log"
	"net/http"
	"time"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/Repository"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/auth"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/config"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/middleware"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/rateLimit"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/user"
	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
)

func Router(db *pgxpool.Pool, cfg *config.Config) http.Handler {
	v1Router := chi.NewRouter()

	/*services*/
	authService := auth.NewService(db, cfg)
	userService := user.NewService(db, cfg)

	/*handlers*/
	authHandler := auth.NewHandler(authService)
	userHandler := user.NewHandler(userService)

	/*middleware*/
	m := middleware.NewMiddleware(Repository.New(db), cfg)

	/*RATE LIMITING */
	authStore, err := rateLimit.NewStore(10, time.Minute)
	if err != nil {
		log.Fatal(err)
	}
	var header string
	if cfg.AppEnv == "production" {
		header = "True-Client-IP"
	}
	authRL, err := rateLimit.NewLimitMiddleware(authStore, header)
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
	v1Router.Route("/auth", func(v1 chi.Router) {
		v1.Use(authRL.Handle)
		v1.Mount("/", auth.Routes(authHandler))
	})
	v1Router.Route("/api", func(v1 chi.Router) {
		v1.Use(m.AuthMiddleware)
		v1.Mount("/", user.Routes(userHandler))

	})
	return v1Router
}
