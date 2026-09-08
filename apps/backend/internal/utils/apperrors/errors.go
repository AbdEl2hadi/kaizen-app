package apperrors

type AppError struct {
	Status  int
	Message string
}

func (e *AppError) Error() string {
	return e.Message
}

func NewAppError(status int, message string) *AppError {
	return &AppError{Status: status, Message: message}
}
