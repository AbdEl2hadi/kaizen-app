package app

import (
	"fmt"
	"net/http"
	"time"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/config"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/database"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/oauth"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/router"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/robfig/cron"
)

type App struct {
	cfg    *config.Config
	db     *pgxpool.Pool
	server *http.Server
	cron   *cron.Cron
}

func NewApp() (*App, error) {
	cfg, err := config.Load()
	if err != nil {
		return nil, err
	}
	db, err := database.Connect(cfg.DataBaseURL)
	if err != nil {
		return nil, err
	}
	oauth.Init(cfg)

	c, err := newCleanupCron(db, cfg)
	if err != nil {
		return nil, err
	}

	r := router.Routes(db, cfg)

	app := &App{
		cfg: cfg,
		db:  db,
		server: &http.Server{
			Addr:         cfg.Port,
			Handler:      r,
			ReadTimeout:  10 * time.Second,
			WriteTimeout: 10 * time.Second,
			IdleTimeout:  60 * time.Second,
		},
		cron: c,
	}
	return app, nil
}

func (app *App) Start() error {
	fmt.Printf("server started on http://localhost%s\n", app.cfg.Port)
	fmt.Printf("test the server here :  http://localhost%s/health\n", app.cfg.Port)
	defer app.db.Close()
	defer app.cron.Stop()
	if err := app.server.ListenAndServe(); err != nil {
		return err
	}

	return nil
}
