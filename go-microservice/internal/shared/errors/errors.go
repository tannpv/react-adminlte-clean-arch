package errors

import "errors"

var (
	ErrNotFound     = errors.New("resource not found")
	ErrValidation   = errors.New("validation error")
	ErrUnauthorized = errors.New("unauthorized")
	ErrForbidden    = errors.New("forbidden")
	ErrConflict     = errors.New("resource conflict")
	ErrInternal     = errors.New("internal server error")
)

type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func (e ValidationError) Error() string {
	return e.Message
}

func IsNotFoundError(err error) bool {
	return errors.Is(err, ErrNotFound)
}

func IsValidationError(err error) bool {
	return errors.Is(err, ErrValidation)
}

func IsUnauthorizedError(err error) bool {
	return errors.Is(err, ErrUnauthorized)
}

func IsForbiddenError(err error) bool {
	return errors.Is(err, ErrForbidden)
}

func IsConflictError(err error) bool {
	return errors.Is(err, ErrConflict)
}

func IsInternalError(err error) bool {
	return errors.Is(err, ErrInternal)
}
