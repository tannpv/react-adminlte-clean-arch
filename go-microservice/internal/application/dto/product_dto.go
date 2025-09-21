package dto

import (
	"time"

	"github.com/google/uuid"
)

type CreateProductRequest struct {
	Name        string     `json:"name" validate:"required,min=2,max=200"`
	Description string     `json:"description" validate:"max=1000"`
	SKU         string     `json:"sku" validate:"required,min=3,max=50"`
	Price       int64      `json:"price" validate:"required,min=1"`
	Currency    string     `json:"currency" validate:"required,len=3"`
	CategoryID  *uuid.UUID `json:"category_id,omitempty"`
}

type UpdateProductRequest struct {
	Name        *string    `json:"name,omitempty" validate:"omitempty,min=2,max=200"`
	Description *string    `json:"description,omitempty" validate:"omitempty,max=1000"`
	SKU         *string    `json:"sku,omitempty" validate:"omitempty,min=3,max=50"`
	Price       *int64     `json:"price,omitempty" validate:"omitempty,min=1"`
	Currency    *string    `json:"currency,omitempty" validate:"omitempty,len=3"`
	CategoryID  *uuid.UUID `json:"category_id,omitempty"`
	Status      *string    `json:"status,omitempty" validate:"omitempty,oneof=active inactive draft"`
}

type ProductResponse struct {
	ID          uuid.UUID     `json:"id"`
	Name        string        `json:"name"`
	Description string        `json:"description"`
	SKU         string        `json:"sku"`
	Price       int64         `json:"price"`
	Currency    string        `json:"currency"`
	Status      string        `json:"status"`
	CategoryID  *uuid.UUID    `json:"category_id,omitempty"`
	Category    *CategoryInfo `json:"category,omitempty"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
}

type CategoryInfo struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

type ProductListResponse struct {
	Products []ProductResponse `json:"products"`
	Total    int64             `json:"total"`
	Page     int               `json:"page"`
	Limit    int               `json:"limit"`
}

type UpdateProductPriceRequest struct {
	Price int64 `json:"price" validate:"required,min=1"`
}

type UpdateProductStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=active inactive draft"`
}
