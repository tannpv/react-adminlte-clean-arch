package services

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/southern-martin/go-microservice/internal/application/dto"
	"github.com/southern-martin/go-microservice/internal/domain/entities"
	"github.com/southern-martin/go-microservice/internal/domain/services"
	"github.com/stretchr/testify/assert"
)

func TestUserApplicationService_Structure(t *testing.T) {
	// This is a basic structure test to ensure the service can be instantiated
	// In a real implementation, you would use proper mocking

	service := &UserApplicationService{
		userRepo:      nil, // Would be mocked in real tests
		userDomainSvc: &services.UserDomainService{},
		eventBus:      nil, // Would be mocked in real tests
		jwtSecret:     "test-secret",
		jwtExpiresIn:  24 * time.Hour,
	}

	assert.NotNil(t, service)
	assert.Equal(t, "test-secret", service.jwtSecret)
	assert.Equal(t, 24*time.Hour, service.jwtExpiresIn)
}

func TestUserApplicationService_RequestValidation(t *testing.T) {
	// Test request DTOs
	createReq := &dto.CreateUserRequest{
		Email:    "test@example.com",
		Name:     "Test User",
		Password: "password123",
	}

	assert.Equal(t, "test@example.com", createReq.Email)
	assert.Equal(t, "Test User", createReq.Name)
	assert.Equal(t, "password123", createReq.Password)

	name := "Updated Name"
	email := "updated@example.com"
	updateReq := &dto.UpdateUserRequest{
		Name:  &name,
		Email: &email,
	}

	assert.Equal(t, "Updated Name", *updateReq.Name)
	assert.Equal(t, "updated@example.com", *updateReq.Email)
}

func TestUserApplicationService_ResponseStructure(t *testing.T) {
	// Test response DTOs
	user := &entities.User{
		ID:        uuid.New(),
		Email:     "test@example.com",
		Name:      "Test User",
		Status:    string(entities.UserStatusActive),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	response := &dto.UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		Name:      user.Name,
		Status:    user.Status,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}

	assert.Equal(t, user.ID, response.ID)
	assert.Equal(t, user.Email, response.Email)
	assert.Equal(t, user.Name, response.Name)
	assert.Equal(t, user.Status, response.Status)
}
