package hash

import (
	"crypto/sha256"
	"encoding/hex"
)

func HashFunc(token string) string {
	hasher := sha256.New()
	hasher.Write([]byte(token))
	return hex.EncodeToString(hasher.Sum(nil))
}
