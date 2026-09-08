package middleware

import (
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/cache"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/config"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/db/sqlc"
)

type Middleware struct {
	query  *sqlc.Queries
	config *config.Config
	cache  cache.ICache
}

func NewMiddleware(q *sqlc.Queries, cfg *config.Config, c cache.ICache) *Middleware {
	return &Middleware{
		query:  q,
		config: cfg,
		cache:  c,
	}
}
