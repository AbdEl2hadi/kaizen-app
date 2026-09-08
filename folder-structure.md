# Kaizen App — Folder Structure

## Root

```
kaizen-app/
├── AGENTS.md                          # Agent rules & conventions
├── README.md
├── .env / .env.example / .env.local   # Environment variables
├── api/                               # OpenAPI contract (backend API spec)
│   ├── openapi.yaml
│   ├── paths/
│   │   ├── auth.yaml
│   │   ├── habits.yaml
│   │   └── user.yaml
│   └── schemas/
│       ├── habit.yaml
│       ├── request.yaml
│       ├── response.yaml
│       └── user.yaml
├── apps/
│   ├── backend/                       # Go backend (see below)
│   └── frontend/                      # React/TanStack Start frontend (see below)
└── docker/
    └── docker-compose.yml             # Local services (Postgres, etc.)
```

## apps/backend (Go)

```
apps/backend/
├── go.mod / go.sum
├── sqlc.yaml                          # sqlc config
├── .air.toml                          # Live-reload config
├── test.http                          # Manual API test requests
├── cmd/
│   ├── api/main.go                    # API server entrypoint
│   └── migrate/                       # DB migration entrypoint
├── migrations/
│   └── 20260712144621_init_db.sql     # SQL migrations
├── internal/
│   ├── app/
│   │   ├── app.go                     # App wiring / bootstrap
│   │   └── cron.go                    # Scheduled jobs
│   ├── config/config.go               # Env/config loading
│   ├── database/postgres.go           # Postgres connection
│   ├── db/
│   │   ├── queries/                   # SQL queries (auth.sql, habit.sql, types.sql)
│   │   ├── sqlc/                      # Generated sqlc code
│   │   └── integration/               # DB integration tests
│   ├── mail/
│   │   ├── gmail.go                   # Gmail SMTP client
│   │   ├── mailer.go                  # Mail abstraction
│   │   ├── templates/                 # Compiled HTML templates
│   │   └── _emails/                   # React Email source (TSX)
│   ├── middleware/
│   │   ├── auth.go                    # Auth middleware
│   │   ├── middleware.go
│   │   ├── rate_limit.go
│   │   └── utils.go
│   ├── modules/                       # Feature modules (v1 handlers/services)
│   │   ├── auth/
│   │   │   ├── cleanup.go
│   │   │   └── v1/                    # handler.go, service.go, model.go, router.go, tests
│   │   ├── habits/
│   │   │   └── v1/
│   │   └── user/
│   │       └── v1/
│   ├── oauth/goth.go                  # OAuth (Goth)
│   ├── router/
│   │   ├── router.go
│   │   └── v1/router.go               # v1 route registration
│   └── utils/
│       ├── apperrors/
│       ├── date/
│       ├── hash/
│       ├── httpx/                     # cookie.go, response.go
│       └── validation/
├── scripts/
├── docs/
└── bin/                               # Built binary
```

## apps/frontend (TanStack Start + React)

```
apps/frontend/
├── package.json / bun.lock
├── tsconfig.json
├── vite.config.ts
├── tsr.config.json                    # TanStack Router config
├── components.json                    # shadcn/ui config
├── eslint.config.js
├── prettier.config.js
├── design.md / architecture.md / habit.plan.md   # Planning docs
├── public/
│   └── assets/                        # Images, icons, mascots, video
└── src/
    ├── router.tsx                     # Router setup
    ├── routeTree.gen.ts               # Generated route tree
    ├── styles.css
    ├── components/
    │   ├── landing/                   # Landing page (Hero, Features, CTA, Navbar)
    │   ├── layout/                    # app-sidebar.tsx + sidebar/ (nav-header, nav-main, nav-user)
    │   ├── shared/                    # popup-window.tsx
    │   └── ui/                        # shadcn/ui components
    ├── features/
    │   ├── auth/
    │   │   ├── components/            # Login/SignUp/Verify/Reset pages, AuthLayout
    │   │   ├── hooks/                 # useLogin, useSignUp, useOAuthPopup, ...
    │   │   ├── schema/                # Zod schemas
    │   │   ├── server/                # Server actions (login.server.ts, ...)
    │   │   ├── guard.ts               # Route guards
    │   │   └── types.ts
    │   └── habit/
    │       ├── components/
    │       │   ├── daily-log/         # Log table, chart, cell input, manage panel
    │       │   ├── goals/             # Goals & to-dos panels
    │       │   ├── performance/       # Performance grid, archive habits
    │       │   └── ui/                # progress-bar, segmented-toggle
    │       ├── data/                  # icons, seed data
    │       ├── hooks/                 # use-habit-data, use-log-chart, ...
    │       ├── lib/                   # chart defs, columns, stats, date utils
    │       ├── schema/                # Zod schemas
    │       ├── server/habits.server.ts
    │       ├── store/habit-store.ts
    │       ├── constants.ts
    │       └── types.ts
    ├── hooks/use-mobile.ts
    ├── integrations/tanstack-query/   # devtools.tsx, root-provider.tsx
    ├── lib/
    │   ├── api/                       # client.ts, server.ts, types.ts, session-middleware.ts
    │   ├── env.ts
    │   └── utils.ts
    ├── providers/theme-provider.tsx
    └── routes/
        ├── __root.tsx
        ├── index.tsx                  # Landing
        ├── login.tsx / signup.tsx / forgot-password.tsx / reset-password.tsx / verify-email.tsx
        ├── _auth.tsx                  # Authenticated layout
        └── _auth/
            ├── dashboard.tsx
            ├── calendar.tsx
            ├── achievements.tsx
            ├── settings.tsx
            └── habit/
                ├── daily-log.tsx
                ├── goals-chanlenges.tsx
                ├── performance.tsx
                └── to-dos.tsx
```

## Notes

- Monorepo layout: `apps/` contains both the Go backend and the TanStack Start frontend.
- The API contract lives in `api/` (OpenAPI) and is referenced by both apps.
- Frontend follows a feature-first structure (`src/features/<feature>/{components,hooks,lib,schema,server,store}`).
- Backend follows Go conventions with versioned feature modules under `internal/modules/<feature>/v1`.
- `node_modules`, `.git`, `.idea`, `.tanstack`, and build output are omitted from this tree.
