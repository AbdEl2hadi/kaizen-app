package redis

import (
	"fmt"
	"time"
	"uuid"
)

func SessionKey(env, tokenHash string) string {
	return fmt.Sprintf("kaizen:%s:session:%s", env, tokenHash)
}

func UserKey(env string, id uuid.UUID) string {
	return fmt.Sprintf("kaizen:%s:user:%s", env, id)
}

func LogsKey(env string, userId uuid.UUID, startDate, endDate time.Time) string {
	return fmt.Sprintf("kaizen:%s:logs:%s:%s:%s", env, userId, startDate.Format("2006-01-02"), endDate.Format("2006-01-02"))
}
