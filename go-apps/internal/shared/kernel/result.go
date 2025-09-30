package kernel

// Result represents the result of an operation
type Result[T any] struct {
	Success bool   `json:"success"`
	Data    T      `json:"data,omitempty"`
	Error   string `json:"error,omitempty"`
}

// Ok creates a successful result
func Ok[T any](data T) Result[T] {
	return Result[T]{
		Success: true,
		Data:    data,
	}
}

// Fail creates a failed result
func Fail[T any](error string) Result[T] {
	return Result[T]{
		Success: false,
		Error:   error,
	}
}

// IsSuccess returns true if the result is successful
func (r Result[T]) IsSuccess() bool {
	return r.Success
}

// IsFailure returns true if the result is a failure
func (r Result[T]) IsFailure() bool {
	return !r.Success
}

// GetData returns the data if successful, otherwise panics
func (r Result[T]) GetData() T {
	if !r.Success {
		panic("Cannot get data from failed result")
	}
	return r.Data
}

// GetError returns the error if failed, otherwise returns empty string
func (r Result[T]) GetError() string {
	if r.Success {
		return ""
	}
	return r.Error
}
