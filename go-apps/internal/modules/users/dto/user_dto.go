package dto

import (
	"time"

	"go-apps/internal/modules/users/model"
)

// CreateUserRequest represents the request to create a user
type CreateUserRequest struct {
	Email           string                 `json:"email" binding:"required,email"`
	FirstName       string                 `json:"first_name" binding:"required,min=2,max=50"`
	LastName        string                 `json:"last_name" binding:"required,min=2,max=50"`
	Phone           *string                `json:"phone,omitempty"`
	IsActive        *bool                  `json:"is_active,omitempty"`
	IsEmailVerified *bool                  `json:"is_email_verified,omitempty"`
	DateOfBirth     *time.Time             `json:"date_of_birth,omitempty"`
	Address         *model.Address         `json:"address,omitempty"`
	Preferences     *model.Preferences     `json:"preferences,omitempty"`
	RoleIDs         []uint                 `json:"role_ids,omitempty"`
}

// UpdateUserRequest represents the request to update a user
type UpdateUserRequest struct {
	Email           *string                `json:"email,omitempty" binding:"omitempty,email"`
	FirstName       *string                `json:"first_name,omitempty" binding:"omitempty,min=2,max=50"`
	LastName        *string                `json:"last_name,omitempty" binding:"omitempty,min=2,max=50"`
	Phone           *string                `json:"phone,omitempty"`
	IsActive        *bool                  `json:"is_active,omitempty"`
	IsEmailVerified *bool                  `json:"is_email_verified,omitempty"`
	DateOfBirth     *time.Time             `json:"date_of_birth,omitempty"`
	Address         *model.Address         `json:"address,omitempty"`
	Preferences     *model.Preferences     `json:"preferences,omitempty"`
	RoleIDs         []uint                 `json:"role_ids,omitempty"`
}

// AssignRolesRequest represents the request to assign roles to a user
type AssignRolesRequest struct {
	RoleIDs []uint `json:"role_ids" binding:"required,min=1"`
}

// UserResponse represents the user response
type UserResponse struct {
	ID                uint                   `json:"id"`
	Email             string                 `json:"email"`
	FirstName         string                 `json:"first_name"`
	LastName          string                 `json:"last_name"`
	FullName          string                 `json:"full_name"`
	Phone             *string                `json:"phone,omitempty"`
	IsActive          bool                   `json:"is_active"`
	IsEmailVerified   bool                   `json:"is_email_verified"`
	DateOfBirth       *time.Time             `json:"date_of_birth,omitempty"`
	Address           *model.Address         `json:"address,omitempty"`
	Preferences       *model.Preferences     `json:"preferences,omitempty"`
	LastLoginAt       *time.Time             `json:"last_login_at,omitempty"`
	PasswordChangedAt *time.Time             `json:"password_changed_at,omitempty"`
	Roles             []RoleResponse         `json:"roles,omitempty"`
	CreatedAt         time.Time              `json:"created_at"`
	UpdatedAt         time.Time              `json:"updated_at"`
}

// RoleResponse represents the role response
type RoleResponse struct {
	ID          uint                   `json:"id"`
	Name        string                 `json:"name"`
	Description *string                `json:"description,omitempty"`
	IsActive    bool                   `json:"is_active"`
	Permissions *model.Permissions     `json:"permissions,omitempty"`
	Metadata    *model.Metadata        `json:"metadata,omitempty"`
	CreatedAt   time.Time              `json:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at"`
}

// CreateRoleRequest represents the request to create a role
type CreateRoleRequest struct {
	Name        string              `json:"name" binding:"required,min=2,max=50"`
	Description *string             `json:"description,omitempty"`
	IsActive    *bool               `json:"is_active,omitempty"`
	Permissions *model.Permissions  `json:"permissions,omitempty"`
	Metadata    *model.Metadata     `json:"metadata,omitempty"`
}

// UpdateRoleRequest represents the request to update a role
type UpdateRoleRequest struct {
	Name        *string             `json:"name,omitempty" binding:"omitempty,min=2,max=50"`
	Description *string             `json:"description,omitempty"`
	IsActive    *bool               `json:"is_active,omitempty"`
	Permissions *model.Permissions  `json:"permissions,omitempty"`
	Metadata    *model.Metadata     `json:"metadata,omitempty"`
}

// ToUserResponse converts a User model to UserResponse
func ToUserResponse(user *model.User) *UserResponse {
	if user == nil {
		return nil
	}

	roles := make([]RoleResponse, len(user.Roles))
	for i, role := range user.Roles {
		roles[i] = *ToRoleResponse(&role)
	}

	return &UserResponse{
		ID:                user.ID,
		Email:             user.Email,
		FirstName:         user.FirstName,
		LastName:          user.LastName,
		FullName:          user.FullName(),
		Phone:             user.Phone,
		IsActive:          user.IsActive,
		IsEmailVerified:   user.IsEmailVerified,
		DateOfBirth:       user.DateOfBirth,
		Address:           user.Address,
		Preferences:       user.Preferences,
		LastLoginAt:       user.LastLoginAt,
		PasswordChangedAt: user.PasswordChangedAt,
		Roles:             roles,
		CreatedAt:         user.CreatedAt,
		UpdatedAt:         user.UpdatedAt,
	}
}

// ToRoleResponse converts a Role model to RoleResponse
func ToRoleResponse(role *model.Role) *RoleResponse {
	if role == nil {
		return nil
	}

	return &RoleResponse{
		ID:          role.ID,
		Name:        role.Name,
		Description: role.Description,
		IsActive:    role.IsActive,
		Permissions: role.Permissions,
		Metadata:    role.Metadata,
		CreatedAt:   role.CreatedAt,
		UpdatedAt:   role.UpdatedAt,
	}
}

// ToUserResponses converts a slice of User models to UserResponse slice
func ToUserResponses(users []*model.User) []*UserResponse {
	responses := make([]*UserResponse, len(users))
	for i, user := range users {
		responses[i] = ToUserResponse(user)
	}
	return responses
}

// ToRoleResponses converts a slice of Role models to RoleResponse slice
func ToRoleResponses(roles []*model.Role) []*RoleResponse {
	responses := make([]*RoleResponse, len(roles))
	for i, role := range roles {
		responses[i] = ToRoleResponse(role)
	}
	return responses
}
