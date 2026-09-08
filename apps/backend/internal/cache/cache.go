package cache

import (
	"context"
	"encoding/json/v2"
	"time"
)

type ICache interface {
	Get(ctx context.Context, key string) ([]byte, bool, error)
	Set(ctx context.Context, key string, value any, ttl time.Duration) error
	Delete(ctx context.Context, keys ...string) error
}

func Load[T any](ctx context.Context, c ICache, key string) (T, bool, error) {
	var value T

	if c == nil {
		return value, false, nil
	}

	data, found, err := c.Get(ctx, key)
	if err != nil || !found {
		return value, found, err // real error or miss — caller decides
	}
	if uErr := json.Unmarshal(data, &value); uErr != nil {
		return value, false, uErr // poisoned entry → looks like a miss
	}
	return value, true, nil
}
