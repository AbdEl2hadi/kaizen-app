# Backend Folder Structure

```
backend/
├── cmd/
│   ├── api/
│   │   └── main.go              # API server entrypoint
│   └── migrate/                 # DB migration runner
├── dbTypes/
│   └── types.sql                # Shared SQL type definitions (sqlc)
├── docs/                        # Documentation
├── internal/
│   ├── app/
│   │   ├── app.go               # App bootstrap / server setup
│   │   └── cron.go              # Scheduled jobs (cleanup, etc.)
│   ├── config/
│   │   └── config.go            # Env-based configuration
│   ├── database/
│   │   └── postgres.go          # Postgres connection pool
│   ├── db/
│   │   ├── queries/
│   │   │   ├── auth.sql         # Auth SQL queries (sqlc)
│   │   │   └── habit.sql        # Habit SQL queries (sqlc)
│   │   └── Repository/          # Generated sqlc code
│   │       ├── auth.sql.go
│   │       ├── db.go
│   │       ├── habit.sql.go
│   │       └── models.go
│   ├── mail/
│   │   ├── _emails/             # React Email templates source
│   │   │   ├── src/
│   │   │   │   ├── resetPassword.tsx
│   │   │   │   └── verifyEmail.tsx
│   │   │   ├── package.json
│   │   │   └── package-lock.json
│   │   ├── templates/           # Compiled HTML email templates
│   │   │   ├── resetPassword.html
│   │   │   └── verifyEmail.html
│   │   ├── gmail.go             # Gmail sending integration
│   │   └── mailer.go            # Mailer abstraction
│   ├── middleware/
│   │   ├── auth.go              # Auth middleware
│   │   └── utils.go             # Middleware helpers
│   ├── modules/                 # Feature modules (versioned)
│   │   ├── auth/
│   │   │   └── v1/
│   │   │       ├── cleanup.go   # Expired token cleanup
│   │   │       ├── handler.go   # HTTP handlers
│   │   │       ├── model.go     # DTOs / request models
│   │   │       ├── router.go    # Chi routes
│   │   │       └── service.go   # Business logic
│   │   ├── habits/
│   │   │   └── v1/
│   │   │       ├── handler.go
│   │   │       ├── model.go
│   │   │       ├── router.go
│   │   │       └── service.go
│   │   └── user/
│   │       └── v1/
│   │           ├── handler.go
│   │           ├── model.go
│   │           ├── router.go
│   │           └── service.go
│   ├── oauth/
│   │   └── goth.go              # OAuth (Goth) integration
│   ├── rateLimit/
│   │   └── rateLimit.go         # Rate limiting middleware
│   ├── router/
│   │   ├── v1/
│   │   │   └── router.go        # v1 route wiring
│   │   └── router.go            # Top-level router
│   └── utils/
│       ├── cookie.go
│       ├── date.go
│       ├── errors.go
│       ├── hashFunc.go
│       ├── response.go
│       └── validation.go
├── migrations/
│   └── 20260712144621_init_db.sql
├── scripts/                     # Helper scripts
├── .air.toml                    # Air live-reload config
├── go.mod
├── go.sum
├── sqlc.yaml                    # sqlc codegen config
└── test.http                    # API test requests
```