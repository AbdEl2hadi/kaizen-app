package utils

import (
	"encoding/json"
	"net/http"
)

type APIResponse[T any] struct {
	Success bool   `json:"success"`
	Code    string `json:"code,omitempty"`
	Message string `json:"message,omitempty"`
	Data    T      `json:"data,omitempty"`
}
type UserResponse struct {
	ID            string `json:"id"`
	Username      string `json:"username"`
	PhoneNumber   string `json:"phoneNumber"`
	FullName      string `json:"fullName"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"emailVerified"`
	Bio           string `json:"bio"`
	Image         string `json:"image"`
	CreatedAt     string `json:"createdAt"`
	UpdatedAt     string `json:"updatedAt"`
	DateOfBirth   string `json:"dateOfBirth"`
	Timezone      string `json:"timezone"`
}

func SendSuccess[T any](w http.ResponseWriter, status int, data T, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(APIResponse[T]{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func SendError[T any](w http.ResponseWriter, status int, data T, errMessage string, code string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(APIResponse[T]{
		Success: false,
		Code:    code,
		Message: errMessage,
		Data:    data,
	})
}
