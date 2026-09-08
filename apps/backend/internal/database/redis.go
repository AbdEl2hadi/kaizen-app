package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

func ConnectRedis(redisURL string) (*redis.Client, error) {

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Printf("Redis URL parse error: %s", err.Error())
		return nil, err
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
		log.Printf("connect redis failed: %v", err)
		_ = client.Close()
		return nil, fmt.Errorf("ping redis: %w", err)

	}
	fmt.Println("Successfully connected to redis\n ✓✓✓✓✓✓✓✓✓✓")

	return client, nil
}
