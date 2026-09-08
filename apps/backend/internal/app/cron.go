package app

import (
	"context"
	"log"
	"time"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/config"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/db/sqlc"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/modules/auth"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/robfig/cron"
)

func newCleanupCron(db *pgxpool.Pool, cfg *config.Config) (*cron.Cron, error) {
	query := sqlc.New(db)
	c := cron.New()
	if err := c.AddFunc("@daily", func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := auth.CleanupDaily(ctx, query); err != nil {
			log.Printf("daily cleanup failed: %v", err)
		}
	}); err != nil {
		return nil, err
	}
	c.Start()
	return c, nil
}
