package dto

import (
	"strconv"
)

// PaginationRequest represents pagination request parameters
type PaginationRequest struct {
	Page     int    `form:"page" json:"page"`
	Limit    int    `form:"limit" json:"limit"`
	Search   string `form:"search" json:"search"`
	SortBy   string `form:"sort_by" json:"sort_by"`
	SortOrder string `form:"sort_order" json:"sort_order"`
}

// PaginationResponse represents paginated response
type PaginationResponse[T any] struct {
	Data       []T   `json:"data"`
	Total      int64 `json:"total"`
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	TotalPages int   `json:"total_pages"`
	HasNext    bool  `json:"has_next"`
	HasPrev    bool  `json:"has_prev"`
}

// NewPaginationRequest creates a new pagination request with defaults
func NewPaginationRequest() *PaginationRequest {
	return &PaginationRequest{
		Page:      1,
		Limit:     10,
		SortBy:    "id",
		SortOrder: "asc",
	}
}

// GetOffset returns the offset for database queries
func (p *PaginationRequest) GetOffset() int {
	if p.Page <= 0 {
		p.Page = 1
	}
	return (p.Page - 1) * p.Limit
}

// GetLimit returns the limit with validation
func (p *PaginationRequest) GetLimit() int {
	if p.Limit <= 0 {
		p.Limit = 10
	}
	if p.Limit > 100 {
		p.Limit = 100
	}
	return p.Limit
}

// GetSortBy returns the sort field with validation
func (p *PaginationRequest) GetSortBy() string {
	if p.SortBy == "" {
		return "id"
	}
	return p.SortBy
}

// GetSortOrder returns the sort order with validation
func (p *PaginationRequest) GetSortOrder() string {
	if p.SortOrder != "desc" {
		return "asc"
	}
	return p.SortOrder
}

// NewPaginationResponse creates a new paginated response
func NewPaginationResponse[T any](data []T, total int64, page, limit int) *PaginationResponse[T] {
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	
	return &PaginationResponse[T]{
		Data:       data,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
		HasNext:    page < totalPages,
		HasPrev:    page > 1,
	}
}

// ParsePaginationFromQuery parses pagination from query parameters
func ParsePaginationFromQuery(pageStr, limitStr, search, sortBy, sortOrder string) *PaginationRequest {
	req := NewPaginationRequest()
	
	if pageStr != "" {
		if page, err := strconv.Atoi(pageStr); err == nil && page > 0 {
			req.Page = page
		}
	}
	
	if limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 {
			req.Limit = limit
		}
	}
	
	if search != "" {
		req.Search = search
	}
	
	if sortBy != "" {
		req.SortBy = sortBy
	}
	
	if sortOrder != "" {
		req.SortOrder = sortOrder
	}
	
	return req
}
