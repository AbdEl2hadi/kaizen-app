package env

import (
	"os"
	"strconv"
)


func GetString (key,defaultVal string ) string {
	val , ok := os.LookupEnv(key)
	if !ok {
		return defaultVal
	}
	return val
}

func GetInt (key string , defaultVal int) int {
	val , ok := os.LookupEnv(key)
	if !ok {
		return defaultVal
	}
	valAsInt , err := strconv.Atoi(val)
	if err != nil {
		return defaultVal
	}
	return valAsInt
}