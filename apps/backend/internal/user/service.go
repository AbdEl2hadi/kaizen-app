package user

import (
	"context"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/Repository"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/config"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	db     *pgxpool.Pool
	query  *Repository.Queries
	config *config.Config
}

func NewService(db *pgxpool.Pool, cfg *config.Config) *Service {
	return &Service{
		db:     db,
		config: cfg,
		query:  Repository.New(db),
	}
}

func (service *Service) GetUserByID(ctx context.Context, userID string) (Repository.User, error) {
	ID, err := uuid.Parse(userID)
	if err != nil {
		return Repository.User{}, err
	}

	return service.query.GetUserByID(ctx, ID)
}
