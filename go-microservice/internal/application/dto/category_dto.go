package dto

import (
	"time"

	"github.com/google/uuid"
)

type CreateCategoryRequest struct {
	Name     string     `json:"name" validate:"required,min=2,max=100"`
	ParentID *uuid.UUID `json:"parent_id,omitempty"`
}

type UpdateCategoryRequest struct {
	Name     *string    `json:"name,omitempty" validate:"omitempty,min=2,max=100"`
	ParentID *uuid.UUID `json:"parent_id,omitempty"`
}

type CategoryResponse struct {
	ID        uuid.UUID          `json:"id"`
	Name      string             `json:"name"`
	ParentID  *uuid.UUID         `json:"parent_id,omitempty"`
	Parent    *CategoryInfo      `json:"parent,omitempty"`
	Children  []CategoryResponse `json:"children,omitempty"`
	CreatedAt time.Time          `json:"created_at"`
	UpdatedAt time.Time          `json:"updated_at"`
}

type CategoryListResponse struct {
	Categories []CategoryResponse `json:"categories"`
	Total      int64              `json:"total"`
	Page       int                `json:"page"`
	Limit      int                `json:"limit"`
}

type CategoryTreeResponse struct {
	Categories []CategoryResponse `json:"categories"`
	Tree       []CategoryTreeNode `json:"tree"`
	Hierarchy  []CategoryOption   `json:"hierarchy"`
}

type CategoryTreeNode struct {
	ID       uuid.UUID          `json:"id"`
	Name     string             `json:"name"`
	ParentID *uuid.UUID         `json:"parent_id,omitempty"`
	Depth    int                `json:"depth"`
	Disabled bool               `json:"disabled"`
	Children []CategoryTreeNode `json:"children"`
}

type CategoryOption struct {
	ID       uuid.UUID `json:"id"`
	Label    string    `json:"label"`
	Disabled bool      `json:"disabled"`
}
