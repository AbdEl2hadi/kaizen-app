# ENV handling 

## 1. create env.ts (`/src/lib/env.ts`)

```ts
import {z} from "zod"

const envSchema = z.object({
  // here env variables
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  // handle errors
}

export const env = parsed.data
```

## Philosophy : 

- Never hardcode secrets, URLs, API keys, or credentials.
- Environment variables should be the single source of truth for runtime configuration.

## Access

- Read environment variables from a single configuration module.
- Never access environment variables directly throughout the application.
- Import the configuration object instead (env.ts).

Good:

```ts
import { env } from "@/lib/env.ts"

fetch(`${env.SERVER_URL}/api/users`)
```

Avoid:

```ts
fetch(`${import.meta.env.VITE_SERVER_URL}/api/users`)
```


## Validation

- Validate all required environment variables during application startup.
- Fail fast if a required variable is missing or invalid.
- Never allow the application to continue with an invalid configuration.


## Naming

Follow platform conventions.

Examples(in .env):

```text
VITE_API_URL
VITE_SERVER_URL
VITE_APP_NAME
VITE_APP_VERSION
VITE_ENABLE_ANALYTICS
```

Use uppercase with underscores.

## Defaults

- Provide sensible defaults only for local development.
- Never provide default values for secrets.
- Production configuration must be explicit.

Good:

```ts
PORT ?? 3000
```

Avoid:

```ts
JWT_SECRET ?? "secret"
```

## Secrets

Never expose:

- API secrets
- Database credentials
- Access tokens
- Private keys
- Service account credentials

These belong only on the backend.

## Environment Files

Recommended structure:

```text
.env
.env.local
.env.example
```

Do not commit:

- `.env`
- `.env.local`

Commit:

- `.env.example`

## .env.example

Every environment variable used by the application should exist in `.env.example`.

Example:

```text
VITE_SERVER_URL=
VITE_APP_NAME=
VITE_ENABLE_ANALYTICS=false
```

Never include real secrets or credentials.


## Avoid

- Hardcoded URLs.
- Hardcoded API keys.
- Reading `import.meta.env` throughout the codebase.
- Using environment variables without validation.
- Duplicating configuration values.
- Committing secrets to version control.