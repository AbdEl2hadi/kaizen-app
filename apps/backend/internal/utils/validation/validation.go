package validation

import (
	"encoding/json/v2"
	"log"
	"net/http"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils/httpx"
	"github.com/go-playground/validator/v10"
)

func PayloadValidation[T any](w http.ResponseWriter, r *http.Request, validator *validator.Validate) (T, error) {
	var payload T

	// Decode payload
	if err := json.UnmarshalRead(r.Body, &payload); err != nil {
		log.Printf("failed to decode request body: %v", err)
		httpx.SendError[any](w, http.StatusBadRequest, nil, "Malformed JSON payload", "")
		return payload, err
	}
	// validation
	if err := validator.Struct(payload); err != nil {
		log.Printf("validation failed: %v", err)
		httpx.SendError[any](w, http.StatusBadRequest, nil, "Invalid request payload", "")
		return payload, err
	}
	return payload, nil
}
