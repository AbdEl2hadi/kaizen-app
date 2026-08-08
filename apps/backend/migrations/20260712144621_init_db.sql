-- +goose Up
CREATE TABLE IF NOT EXISTS  users (
    id UUID PRIMARY KEY ,
    username VARCHAR(255) NOT NULL UNIQUE,                  -- GET it from email
    phone_number VARCHAR(15),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    bio TEXT,
    image TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_of_birth DATE,
    timezone TEXT
);

CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,             -- 'google', 'gitHub', 'facebook' , 'credential'
    account_id VARCHAR(255) NOT NULL,
    password_hash TEXT,
    access_token TEXT,                         -- optional: only if you need to call their API later
    access_token_expires_at TIMESTAMPTZ,
    refresh_token_expires_at TIMESTAMPTZ,
    refresh_token TEXT,                        -- optional: same
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(provider, account_id),
    UNIQUE(user_id , provider)
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY ,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,          -- hash of the session token, never store it raw
    ip_address VARCHAR(45),                    -- for security auditing / "new device" alerts
    user_agent TEXT,                           -- same
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- +goose StatementBegin
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TOKEN') THEN
        CREATE TYPE TOKEN  AS ENUM ('password_reset', 'email_verification');
    END IF;
END $$;
-- +goose StatementEnd

CREATE TABLE IF NOT EXISTS tokens ( -- this for password_reset and email_verification
    id UUID PRIMARY KEY ,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_type TOKEN NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,           -- typically 15-60 min expiry
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS login_attempts ( -- this for rate limiting
    id UUID PRIMARY KEY ,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- nullable: attempt might be on an email that doesn't exist
    email VARCHAR(255),                        -- log the attempted email even if lookup fails
    username VARCHAR(255),                     -- log the attempted email even if lookup fails
    ip_address VARCHAR(45),
    success BOOLEAN NOT NULL,
    attempted_at TIMESTAMPTZ DEFAULT now()
);

-- +goose Down
DROP TABLE IF EXISTS login_attempts;
DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS token;
