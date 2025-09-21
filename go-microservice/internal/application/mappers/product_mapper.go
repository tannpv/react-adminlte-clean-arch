package mappers

import (
	"github.com/southern-martin/go-microservice/internal/application/dto"
	"github.com/southern-martin/go-microservice/internal/domain/entities"
)

func ProductToResponse(product *entities.Product) *dto.ProductResponse {
	if product == nil {
		return nil
	}

	response := &dto.ProductResponse{
		ID:          product.ID,
		Name:        product.Name,
		Description: product.Description,
		SKU:         product.SKU,
		Price:       product.Price,
		Currency:    product.Currency,
		Status:      product.Status,
		CategoryID:  product.CategoryID,
		CreatedAt:   product.CreatedAt,
		UpdatedAt:   product.UpdatedAt,
	}

	// Map category if present
	if product.Category != nil {
		response.Category = &dto.CategoryInfo{
			ID:   product.Category.ID,
			Name: product.Category.Name,
		}
	}

	return response
}

func ProductsToResponse(products []*entities.Product) []dto.ProductResponse {
	responses := make([]dto.ProductResponse, len(products))
	for i, product := range products {
		responses[i] = *ProductToResponse(product)
	}
	return responses
}

func CreateProductRequestToEntity(req *dto.CreateProductRequest) *entities.Product {
	return &entities.Product{
		Name:        req.Name,
		Description: req.Description,
		SKU:         req.SKU,
		Price:       req.Price,
		Currency:    req.Currency,
		CategoryID:  req.CategoryID,
	}
}

func UpdateProductRequestToEntity(req *dto.UpdateProductRequest, product *entities.Product) {
	if req.Name != nil {
		product.Name = *req.Name
	}
	if req.Description != nil {
		product.Description = *req.Description
	}
	if req.SKU != nil {
		product.SKU = *req.SKU
	}
	if req.Price != nil {
		product.Price = *req.Price
	}
	if req.Currency != nil {
		product.Currency = *req.Currency
	}
	if req.CategoryID != nil {
		product.CategoryID = req.CategoryID
	}
	if req.Status != nil {
		product.Status = *req.Status
	}
}
