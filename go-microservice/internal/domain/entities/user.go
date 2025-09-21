package entities

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Email     string     `json:"email" gorm:"uniqueIndex;not null"`
	Name      string     `json:"name" gorm:"not null"`
	Password  string     `json:"-" gorm:"not null"`
	Status    string     `json:"status" gorm:"default:active"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty" gorm:"index"`
}

type UserStatus string

const (
	UserStatusActive   UserStatus = "active"
	UserStatusInactive UserStatus = "inactive"
	UserStatusBlocked  UserStatus = "blocked"
)

func (u *User) SetStatus(status UserStatus) {
	u.Status = string(status)
}

func (u *User) IsActive() bool {
	return u.Status == string(UserStatusActive)
}
