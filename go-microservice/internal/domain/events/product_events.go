package events

import (
	"time"

	"github.com/google/uuid"
)

type ProductCreatedEvent struct {
	ProductID uuid.UUID `json:"product_id"`
	Name      string    `json:"name"`
	SKU       string    `json:"sku"`
	Price     int64     `json:"price"`
	CreatedAt time.Time `json:"created_at"`
}

type ProductUpdatedEvent struct {
	ProductID uuid.UUID `json:"product_id"`
	Name      string    `json:"name"`
	SKU       string    `json:"sku"`
	Price     int64     `json:"price"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ProductDeletedEvent struct {
	ProductID uuid.UUID `json:"product_id"`
	DeletedAt time.Time `json:"deleted_at"`
}

type ProductStatusChangedEvent struct {
	ProductID uuid.UUID `json:"product_id"`
	OldStatus string    `json:"old_status"`
	NewStatus string    `json:"new_status"`
	ChangedAt time.Time `json:"changed_at"`
}
