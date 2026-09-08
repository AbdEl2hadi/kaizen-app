package integration

import (
	"context"
	"testing"
	"time"

	"github.com/redis/go-redis/v9"
)

const defaultTestRedisURL = "redis://localhost:6380"

func NewTestRedis(t *testing.T) *redis.Client {

	t.Helper()

	opt, err := redis.ParseURL(defaultTestRedisURL)
	if err != nil {
		t.Fatalf("Redis URL parse error: %s", err.Error())
	}

	// settings :
	opt.PoolSize = 20
	opt.MinIdleConns = 5
	opt.MaxRetries = 3
	opt.DialTimeout = 3 * time.Second

	client := redis.NewClient(opt)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err = client.Ping(ctx).Err(); err != nil {
		_ = client.Close()
		t.Fatalf("redis ping failed: %s", err.Error())

	}
	t.Cleanup(func() {
		_ = client.Close()
	})

	return client

}

func cleanRedis(t *testing.T, rdb *redis.Client) {
	t.Helper()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := rdb.FlushAll(ctx).Err(); err != nil {
		t.Fatalf("failed to clean test tables: %v", err)
	}
	t.Cleanup(func() {
		if err := rdb.FlushAll(ctx).Err(); err != nil {
			t.Errorf("failed to clean test tables after test: %v", err)
		}
	})
}
