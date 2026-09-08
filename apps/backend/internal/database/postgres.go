package database

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func ConnectDB(databaseURL string) (*pgxpool.Pool, error) {

	pool, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err = pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, err
	}
	fmt.Println("Successfully connected to database\n ✓✓✓✓✓✓✓✓✓✓")
	return pool, nil
}
