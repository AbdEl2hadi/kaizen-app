package middleware

import (
	"context"
	"errors"

	"uuid"
)

type contextKey string

const userIDKey contextKey = "userID"

func UserIDFromContext(ctx context.Context) (uuid.UUID, error) {
	id, ok := ctx.Value(userIDKey).(uuid.UUID)
	if !ok {
		return uuid.Nil(), errors.New("invalid user id")
	}

	return id, nil
}
