package integration

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

const defaultTestDatabaseURL = "postgres://test:test@localhost:5433/kaizen_test?sslmode=disable"

func TestDatabaseURL(t *testing.T) string {
	if url := os.Getenv("TEST_DATABASE_URL"); url != "" {
		t.Logf("environment variable TEST_DATABASE_URL hit : %s", url)
		return url
	}
	return defaultTestDatabaseURL
}

func NewTestDB(t *testing.T) *pgxpool.Pool {
	t.Helper()

	url := TestDatabaseURL(t)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	db, err := pgxpool.New(ctx, url)
	if err != nil {
		t.Fatalf("failed to create test database pool for %q: %v", url, err)
	}

	if err = db.Ping(ctx); err != nil {
		db.Close()
		t.Fatalf(
			"cannot connect to test database %q: %v\n"+
				"start the container:  docker compose -f docker/docker-compose.yml up -d\n"+
				"then migrate schema: bash apps/backend/scripts/reset-test-db.sh",
			url, err,
		)
	}

	t.Cleanup(func() { db.Close() })
	return db
}

func CleanTables(t *testing.T, db *pgxpool.Pool) {
	t.Helper()
	truncate := func() error {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_, err := db.Exec(ctx, `TRUNCATE TABLE login_attempts, tokens, sessions, accounts, users CASCADE`)
		return err
	}
	if err := truncate(); err != nil {
		t.Fatalf("failed to clean test tables: %v", err)
	}
	t.Cleanup(func() {
		if err := truncate(); err != nil {
			t.Errorf("failed to clean test tables after test: %v", err)
		}
	})
}
