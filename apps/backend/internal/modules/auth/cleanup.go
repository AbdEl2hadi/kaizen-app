package auth

import (
	"context"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/db/sqlc"
)

func CleanupDaily(ctx context.Context, query *sqlc.Queries) error {
	if err := query.DailyDeleteLoginAttempts(ctx); err != nil {
		return err
	}
	return query.DailyDeleteUsersWithEmailNotVerified(ctx)
}
