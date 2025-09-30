package kernel

import (
	"time"

	"gorm.io/gorm"
)

// BaseEntity represents the base entity with common fields
type BaseEntity struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

// BeforeCreate is called before creating a record
func (b *BaseEntity) BeforeCreate(tx *gorm.DB) error {
	now := time.Now()
	b.CreatedAt = now
	b.UpdatedAt = now
	return nil
}

// BeforeUpdate is called before updating a record
func (b *BaseEntity) BeforeUpdate(tx *gorm.DB) error {
	b.UpdatedAt = time.Now()
	return nil
}

// IsNew returns true if the entity is new (ID is 0)
func (b *BaseEntity) IsNew() bool {
	return b.ID == 0
}

// GetID returns the entity ID
func (b *BaseEntity) GetID() uint {
	return b.ID
}

// SetID sets the entity ID
func (b *BaseEntity) SetID(id uint) {
	b.ID = id
}

// GetCreatedAt returns the creation timestamp
func (b *BaseEntity) GetCreatedAt() time.Time {
	return b.CreatedAt
}

// GetUpdatedAt returns the update timestamp
func (b *BaseEntity) GetUpdatedAt() time.Time {
	return b.UpdatedAt
}
