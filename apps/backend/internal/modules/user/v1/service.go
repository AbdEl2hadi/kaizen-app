package v1

import (
	"context"
	"log"
	"time"

	"uuid"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/cache"
	goRedis "github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/cache/redis"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/config"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/db/sqlc"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	db     *pgxpool.Pool
	query  *sqlc.Queries
	config *config.Config
	cache  cache.ICache
}

func NewService(db *pgxpool.Pool, cfg *config.Config, c cache.ICache) *Service {
	return &Service{
		db:     db,
		config: cfg,
		query:  sqlc.New(db),
		cache:  c,
	}
}

func (service *Service) GetUserByID(ctx context.Context, userID uuid.UUID) (sqlc.User, error) {

	userKey := goRedis.UserKey(service.config.AppEnv, userID)
	user, found, err := cache.Load[sqlc.User](ctx, service.cache, userKey)

	switch {
	case err != nil:
		log.Printf("user cache miss /me %s", userID)
	case found:
		log.Printf("user cache hit me /me %s", userID)
		return user, nil
	}
	// cache miss
	user, err = service.query.GetUserByID(ctx, userID)

	if err != nil {
		log.Printf("user cache miss /me %s", userID)
		return sqlc.User{}, err
	}
	_ = service.cache.Set(ctx, userKey, user, 10*time.Minute)

	return user, nil
}
