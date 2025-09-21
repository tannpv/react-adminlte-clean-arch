package services

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/southern-martin/go-microservice/internal/domain/entities"
	"github.com/southern-martin/go-microservice/internal/domain/repositories"
)

type ProductDomainService struct {
	productRepo repositories.ProductRepository
}

func NewProductDomainService(productRepo repositories.ProductRepository) *ProductDomainService {
	return &ProductDomainService{
		productRepo: productRepo,
	}
}

func (s *ProductDomainService) CreateProduct(ctx context.Context, name, description, sku string, price int64, currency string, categoryID *uuid.UUID) (*entities.Product, error) {
	// Check if SKU already exists
	existingProduct, err := s.productRepo.GetBySKU(ctx, sku)
	if err == nil && existingProduct != nil {
		return nil, errors.New("product with this SKU already exists")
	}

	product := &entities.Product{
		ID:          uuid.New(),
		Name:        name,
		Description: description,
		SKU:         sku,
		Price:       price,
		Currency:    currency,
		Status:      string(entities.ProductStatusActive),
		CategoryID:  categoryID,
	}

	if err := s.productRepo.Create(ctx, product); err != nil {
		return nil, err
	}

	return product, nil
}

func (s *ProductDomainService) UpdateProduct(ctx context.Context, productID uuid.UUID, name, description, sku string, price int64, currency string, categoryID *uuid.UUID) (*entities.Product, error) {
	product, err := s.productRepo.GetByID(ctx, productID)
	if err != nil {
		return nil, err
	}

	// Check if SKU is being changed and if new SKU already exists
	if sku != product.SKU {
		existingProduct, err := s.productRepo.GetBySKU(ctx, sku)
		if err == nil && existingProduct != nil {
			return nil, errors.New("product with this SKU already exists")
		}
	}

	product.Name = name
	product.Description = description
	product.SKU = sku
	product.Price = price
	product.Currency = currency
	product.CategoryID = categoryID

	if err := s.productRepo.Update(ctx, product); err != nil {
		return nil, err
	}

	return product, nil
}

func (s *ProductDomainService) ActivateProduct(ctx context.Context, productID uuid.UUID) error {
	product, err := s.productRepo.GetByID(ctx, productID)
	if err != nil {
		return err
	}

	product.SetStatus(entities.ProductStatusActive)
	return s.productRepo.Update(ctx, product)
}

func (s *ProductDomainService) DeactivateProduct(ctx context.Context, productID uuid.UUID) error {
	product, err := s.productRepo.GetByID(ctx, productID)
	if err != nil {
		return err
	}

	product.SetStatus(entities.ProductStatusInactive)
	return s.productRepo.Update(ctx, product)
}

func (s *ProductDomainService) SetProductAsDraft(ctx context.Context, productID uuid.UUID) error {
	product, err := s.productRepo.GetByID(ctx, productID)
	if err != nil {
		return err
	}

	product.SetStatus(entities.ProductStatusDraft)
	return s.productRepo.Update(ctx, product)
}

func (s *ProductDomainService) ChangeProductPrice(ctx context.Context, productID uuid.UUID, newPrice int64) error {
	product, err := s.productRepo.GetByID(ctx, productID)
	if err != nil {
		return err
	}

	product.Price = newPrice
	return s.productRepo.Update(ctx, product)
}
