package entities

import (
	"time"

	"github.com/google/uuid"
)

type Product struct {
	ID          uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name        string     `json:"name" gorm:"not null"`
	Description string     `json:"description"`
	SKU         string     `json:"sku" gorm:"uniqueIndex;not null"`
	Price       int64      `json:"price" gorm:"not null"` // Price in cents
	Currency    string     `json:"currency" gorm:"default:USD"`
	Status      string     `json:"status" gorm:"default:active"`
	CategoryID  *uuid.UUID `json:"category_id"`
	Category    *Category  `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty" gorm:"index"`
}

type ProductStatus string

const (
	ProductStatusActive   ProductStatus = "active"
	ProductStatusInactive ProductStatus = "inactive"
	ProductStatusDraft    ProductStatus = "draft"
)

func (p *Product) SetStatus(status ProductStatus) {
	p.Status = string(status)
}

func (p *Product) IsActive() bool {
	return p.Status == string(ProductStatusActive)
}
