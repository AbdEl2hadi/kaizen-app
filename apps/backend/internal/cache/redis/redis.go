package redis

import (
	"context"
	"encoding/json/v2"
	"errors"
	"time"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/cache"
	goRedis "github.com/redis/go-redis/v9"
)

type Cache struct {
	rdb *goRedis.Client
}

var _ cache.ICache = (*Cache)(nil)

func New(rdb *goRedis.Client) *Cache {
	return &Cache{rdb: rdb}
}

func (c *Cache) Get(ctx context.Context, key string) ([]byte, bool, error) {

	if c == nil || c.rdb == nil {
		return nil, false, nil // cache disabled -> always a miss
	}

	val, err := c.rdb.Get(ctx, key).Bytes()
	if errors.Is(err, goRedis.Nil) {
		return nil, false, nil // Cache miss
	}
	if err != nil {
		return nil, false, err // Real failure
	}
	return val, true, nil

}

func (c *Cache) Set(ctx context.Context, key string, value any, ttl time.Duration) error {

	if c == nil || c.rdb == nil {
		return nil
	}

	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return c.rdb.Set(ctx, key, data, ttl).Err()
}

func (c *Cache) Delete(ctx context.Context, keys ...string) error {

	if c == nil || c.rdb == nil {
		return nil
	}

	if len(keys) == 0 {
		return nil
	}
	return c.rdb.Del(ctx, keys...).Err()
}
