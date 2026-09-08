package httpx

import (
	"encoding/json/v2"
	"net/http"

	"uuid"
)

type APIResponse[T any] struct {
	Success bool   `json:"success"`
	Code    string `json:"code,omitempty"`
	Message string `json:"message,omitempty"`
	Data    T      `json:"data,omitempty"`
}

type UserResponse struct {
	ID            uuid.UUID `json:"id"`
	Username      string    `json:"username"`
	PhoneNumber   string    `json:"phoneNumber"`
	FullName      string    `json:"fullName"`
	Email         string    `json:"email"`
	EmailVerified bool      `json:"emailVerified"`
	Bio           string    `json:"bio"`
	Image         string    `json:"image"`
	CreatedAt     string    `json:"createdAt"`
	UpdatedAt     string    `json:"updatedAt"`
	DateOfBirth   string    `json:"dateOfBirth"`
	Timezone      string    `json:"timezone"`
}

func SendSuccess[T any](w http.ResponseWriter, status int, data T, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.MarshalWrite(w, APIResponse[T]{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func SendError[T any](w http.ResponseWriter, status int, data T, errMessage string, code string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.MarshalWrite(w, APIResponse[T]{
		Success: false,
		Code:    code,
		Message: errMessage,
		Data:    data,
	})
}
