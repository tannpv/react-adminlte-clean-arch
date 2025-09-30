package model

import (
	"strings"
	"time"

	"go-apps/internal/shared/kernel"

	"gorm.io/gorm"
)

// User represents a user entity
type User struct {
	kernel.BaseEntity
	Email           string    `json:"email" gorm:"uniqueIndex;not null"`
	FirstName       string    `json:"first_name" gorm:"not null"`
	LastName        string    `json:"last_name" gorm:"not null"`
	Phone           *string   `json:"phone,omitempty"`
	IsActive        bool      `json:"is_active" gorm:"default:true"`
	IsEmailVerified bool      `json:"is_email_verified" gorm:"default:false"`
	DateOfBirth     *time.Time `json:"date_of_birth,omitempty" gorm:"type:date"`
	Address         *Address  `json:"address,omitempty" gorm:"embedded;embeddedPrefix:address_"`
	Preferences     *Preferences `json:"preferences,omitempty" gorm:"type:json"`
	LastLoginAt     *time.Time `json:"last_login_at,omitempty"`
	PasswordChangedAt *time.Time `json:"password_changed_at,omitempty"`
	Roles           []Role    `json:"roles,omitempty" gorm:"many2many:user_roles;"`
}

// Address represents user address information
type Address struct {
	Street  string `json:"street,omitempty"`
	City    string `json:"city,omitempty"`
	State   string `json:"state,omitempty"`
	ZipCode string `json:"zip_code,omitempty"`
	Country string `json:"country,omitempty"`
}

// Preferences represents user preferences
type Preferences map[string]interface{}

// Role represents a role entity
type Role struct {
	kernel.BaseEntity
	Name        string       `json:"name" gorm:"uniqueIndex;not null"`
	Description *string      `json:"description,omitempty"`
	IsActive    bool         `json:"is_active" gorm:"default:true"`
	Permissions *Permissions `json:"permissions,omitempty" gorm:"type:json"`
	Metadata    *Metadata    `json:"metadata,omitempty" gorm:"type:json"`
}

// Permissions represents role permissions
type Permissions []string

// Metadata represents role metadata
type Metadata map[string]interface{}

// TableName returns the table name for User
func (User) TableName() string {
	return "users"
}

// TableName returns the table name for Role
func (Role) TableName() string {
	return "roles"
}

// FullName returns the user's full name
func (u *User) FullName() string {
	return strings.TrimSpace(u.FirstName + " " + u.LastName)
}

// HasRole checks if the user has a specific role
func (u *User) HasRole(roleName string) bool {
	for _, role := range u.Roles {
		if role.Name == roleName {
			return true
		}
	}
	return false
}

// HasPermission checks if the user has a specific permission
func (u *User) HasPermission(permission string) bool {
	for _, role := range u.Roles {
		if role.HasPermission(permission) {
			return true
		}
	}
	return false
}

// IsAdmin checks if the user is an admin
func (u *User) IsAdmin() bool {
	return u.HasRole("admin") || u.HasRole("super_admin")
}

// CanManageUsers checks if the user can manage other users
func (u *User) CanManageUsers() bool {
	return u.HasPermission("users.manage") || u.IsAdmin()
}

// NormalizeEmail normalizes the email address
func (u *User) NormalizeEmail() {
	u.Email = strings.ToLower(strings.TrimSpace(u.Email))
}

// BeforeCreate is called before creating a user
func (u *User) BeforeCreate(tx *gorm.DB) error {
	u.NormalizeEmail()
	return u.BaseEntity.BeforeCreate(tx)
}

// BeforeUpdate is called before updating a user
func (u *User) BeforeUpdate(tx *gorm.DB) error {
	u.NormalizeEmail()
	return u.BaseEntity.BeforeUpdate(tx)
}

// HasPermission checks if the role has a specific permission
func (r *Role) HasPermission(permission string) bool {
	if r.Permissions == nil {
		return false
	}
	
	for _, p := range *r.Permissions {
		if p == permission {
			return true
		}
	}
	return false
}

// AddPermission adds a permission to the role
func (r *Role) AddPermission(permission string) {
	if r.Permissions == nil {
		r.Permissions = &Permissions{}
	}
	
	// Check if permission already exists
	for _, p := range *r.Permissions {
		if p == permission {
			return
		}
	}
	
	*r.Permissions = append(*r.Permissions, permission)
}

// RemovePermission removes a permission from the role
func (r *Role) RemovePermission(permission string) {
	if r.Permissions == nil {
		return
	}
	
	for i, p := range *r.Permissions {
		if p == permission {
			*r.Permissions = append((*r.Permissions)[:i], (*r.Permissions)[i+1:]...)
			return
		}
	}
}
