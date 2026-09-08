-- +goose Up
CREATE TABLE IF NOT EXISTS  users (
    id UUID PRIMARY KEY ,
    username VARCHAR(255) NOT NULL ,                  -- unique handle, e.g. derived from email prefix at signup
    phone_number VARCHAR(16),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL ,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    bio TEXT,
    image TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_of_birth DATE,
    timezone TEXT,

    CONSTRAINT users_username_unique UNIQUE (username),
    CONSTRAINT users_email_unique UNIQUE (email)
);

/* =============AUTH SECTION==============================*/

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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider, account_id),
    UNIQUE(user_id , provider)
);



-- +goose StatementBegin
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- +goose StatementEnd

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
DROP TRIGGER IF EXISTS trg_accounts_updated_at ON accounts;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();



CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY ,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,          -- hash of the session token, never store it raw
    ip_address VARCHAR(45),                    -- for security auditing / "new device" alerts
    user_agent TEXT,                           -- same
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_token_hash
ON sessions(token_hash);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id
ON sessions(user_id);


-- +goose StatementBegin
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'token') THEN
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tokens_user_type_created
ON tokens(user_id, token_type, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tokens_hash
ON tokens(token_hash);


CREATE TABLE IF NOT EXISTS login_attempts ( -- log the attempted username even if lookup fails
    id UUID PRIMARY KEY ,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- nullable: attempt might be on an email that doesn't exist
    email VARCHAR(255),                        -- log the attempted email even if lookup fails
    username VARCHAR(255),                     -- log the attempted email even if lookup fails
    ip_address VARCHAR(45),
    success BOOLEAN NOT NULL,
    attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time
ON login_attempts(ip_address, attempted_at) WHERE success = false;

CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time
ON login_attempts(email, attempted_at) WHERE success = false;

CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id
ON login_attempts(user_id);


/* =============HABITS SECTION==============================*/

-- +goose StatementBegin
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'habit_input_type') THEN
        CREATE TYPE HABIT_INPUT_TYPE AS ENUM ( 'checkbox','text','number','select','multiselect','percent','date','files','url');
    END IF;
END $$;
-- +goose StatementEnd


CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY ,

    user_id UUID NOT NULL
        REFERENCES users(id)
            ON DELETE CASCADE,

    habit_name TEXT NOT NULL,

    icon TEXT NOT NULL ,

    input_type HABIT_INPUT_TYPE NOT NULL,

    input_config JSONB NOT NULL DEFAULT '{}',

    sort_order INTEGER NOT NULL DEFAULT 0,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_habits_user_active_sort
ON habits(user_id, is_active, sort_order);

CREATE INDEX IF NOT EXISTS idx_habits_user_active_id
ON habits(user_id, is_active, id);


CREATE TABLE IF NOT EXISTS daily_habit_entries (

    habit_id UUID NOT NULL
        REFERENCES habits(id)
            ON DELETE CASCADE,

    entry_date DATE NOT NULL,

    value JSONB,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (habit_id, entry_date)
);




-- +goose Down


DROP TABLE IF EXISTS daily_habit_entries;
DROP TABLE IF EXISTS habits;

DROP TABLE IF EXISTS login_attempts;
DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS habit_input_type;
DROP TYPE IF EXISTS token;

DROP FUNCTION IF EXISTS set_updated_at();
