package middleware

import (
	"time"

	"github.com/sethvargo/go-limiter"
	"github.com/sethvargo/go-limiter/httplimit"
	"github.com/sethvargo/go-limiter/memorystore"
)

func NewStore(tokens uint64, interval time.Duration) (limiter.Store, error) {
	return memorystore.New(&memorystore.Config{
		Tokens:   tokens,
		Interval: interval,
	})
}

func NewLimitMiddleware(store limiter.Store, headers ...string) (*httplimit.Middleware, error) {
	return httplimit.NewMiddleware(store, httplimit.IPKeyFunc(headers...))
}
