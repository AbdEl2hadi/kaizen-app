-- name: CreateUser :one
INSERT INTO users( id , username , email , email_verified , full_name, date_of_birth , last_login , timezone  )
VALUES ($1, $2, $3, $4, $5, $6 , $7 , $8)
RETURNING *;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;

-- name: CreateToken :one
INSERT INTO tokens (id,user_id,token_type,token_hash,expires_at)
VALUES ($1 , $2 , $3, $4 , $5)
RETURNING *;

-- name: GetAndUseToken :one
DELETE FROM tokens
WHERE token_hash = $1
  AND token_type = $2
  AND expires_at > NOW()
RETURNING user_id;

-- name: GetLatestUnusedToken :one
SELECT id, expires_at, created_at
FROM tokens
WHERE user_id = $1
  AND token_type = $2
ORDER BY created_at DESC
LIMIT 1;

-- name: DeleteUnusedTokensForUser :exec
DELETE FROM tokens
WHERE user_id = $1
  AND token_type = $2;


-- name: SetVerifiedEmail :exec
UPDATE users SET email_verified = $1
WHERE id = $2;

-- name: SetNewPassword :exec
UPDATE accounts SET password_hash = $1
WHERE user_id = $2;

-- name: GetUserByEmailOrUsername :one
SELECT * FROM users
WHERE (username = $1 OR email = $1)
LIMIT 1 FOR UPDATE;

-- name: GetUserByID :one
SELECT * FROM users
WHERE id = $1
LIMIT 1;

-- name: UpdateLastLogin :exec
UPDATE users SET last_login = NOW()
WHERE id = $1;

-- name: CreateSession :exec
INSERT INTO sessions (id, user_id, token_hash, ip_address, user_agent, expires_at)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: GetSessionByHash :one
SELECT user_id, expires_at
FROM sessions
WHERE token_hash = $1 AND expires_at > NOW()
LIMIT 1;

-- name: DeleteSession :exec
DELETE FROM sessions
WHERE token_hash = $1;

-- name: DeleteSessionsForUser :exec
DELETE FROM sessions
WHERE user_id = $1;

-- name: InsertLoginAttempt :exec
INSERT INTO login_attempts (id, user_id, email , username, ip_address, success)
VALUES ($1, $2, $3,  $4,  $5, $6);



-- name: CountRecentFailedAttempts :one
SELECT COUNT(*) FROM login_attempts
WHERE (email = $1 OR username = $1 OR ip_address = $2)
  AND success = false
  AND attempted_at > NOW() - INTERVAL '15 minutes';



-- name: GetAccountByProvider :one
SELECT * FROM accounts
WHERE provider = $1
AND account_id = $2
LIMIT 1;

-- name: GetUserWithCredential :one
SELECT u.*, a.password_hash FROM users u
JOIN accounts a ON a.user_id = u.id AND a.provider = 'credential'
WHERE (u.username = $1 OR u.email = $1) LIMIT 1 FOR UPDATE;

-- name: CreateAccount :one
INSERT INTO accounts (id , user_id , provider , account_id ,password_hash, access_token ,access_token_expires_at ,  refresh_token , refresh_token_expires_at  )
VALUES ($1 , $2 , $3 , $4 , $5 , $6 , $7 , $8 , $9 )
RETURNING * ;

-- name: IsUsernameExist :one
SELECT EXISTS(
    SELECT 1
    FROM users
    WHERE username = $1
);



/* TTL CLEANUP*/

-- name: DailyDeleteLoginAttempts :exec
DELETE FROM login_attempts
WHERE attempted_at < NOW() - INTERVAL '24 hours';

-- name: DailyDeleteUsersWithEmailNotVerified :exec
DELETE FROM users
WHERE email_verified = FALSE
AND created_at < NOW() - INTERVAL '168 hours';