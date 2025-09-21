package entities

import (
	"time"

	"github.com/google/uuid"
)

type Category struct {
	ID        uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name      string     `json:"name" gorm:"not null"`
	ParentID  *uuid.UUID `json:"parent_id"`
	Parent    *Category  `json:"parent,omitempty" gorm:"foreignKey:ParentID"`
	Children  []Category `json:"children,omitempty" gorm:"foreignKey:ParentID"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty" gorm:"index"`
}
