package entities

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestUser_IsActive(t *testing.T) {
	tests := []struct {
		name     string
		status   string
		expected bool
	}{
		{
			name:     "Active user should return true",
			status:   string(UserStatusActive),
			expected: true,
		},
		{
			name:     "Inactive user should return false",
			status:   string(UserStatusInactive),
			expected: false,
		},
		{
			name:     "Blocked user should return false",
			status:   string(UserStatusBlocked),
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user := &User{
				ID:        uuid.New(),
				Email:     "test@example.com",
				Name:      "Test User",
				Status:    tt.status,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}

			result := user.IsActive()
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestUser_SetStatus(t *testing.T) {
	user := &User{
		ID:        uuid.New(),
		Email:     "test@example.com",
		Name:      "Test User",
		Status:    string(UserStatusActive),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	tests := []struct {
		name           string
		status         UserStatus
		expectedStatus string
	}{
		{
			name:           "Set to active",
			status:         UserStatusActive,
			expectedStatus: string(UserStatusActive),
		},
		{
			name:           "Set to inactive",
			status:         UserStatusInactive,
			expectedStatus: string(UserStatusInactive),
		},
		{
			name:           "Set to blocked",
			status:         UserStatusBlocked,
			expectedStatus: string(UserStatusBlocked),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user.SetStatus(tt.status)
			assert.Equal(t, tt.expectedStatus, user.Status)
		})
	}
}
