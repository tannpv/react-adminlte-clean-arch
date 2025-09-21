package services

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/southern-martin/go-microservice/internal/application/dto"
	"github.com/southern-martin/go-microservice/internal/application/mappers"
	"github.com/southern-martin/go-microservice/internal/domain/events"
	"github.com/southern-martin/go-microservice/internal/domain/repositories"
	"github.com/southern-martin/go-microservice/internal/domain/services"
)

type ProductApplicationService struct {
	productRepo      repositories.ProductRepository
	productDomainSvc *services.ProductDomainService
	eventBus         events.EventBus
}

func NewProductApplicationService(
	productRepo repositories.ProductRepository,
	productDomainSvc *services.ProductDomainService,
	eventBus events.EventBus,
) *ProductApplicationService {
	return &ProductApplicationService{
		productRepo:      productRepo,
		productDomainSvc: productDomainSvc,
		eventBus:         eventBus,
	}
}

func (s *ProductApplicationService) CreateProduct(ctx context.Context, req *dto.CreateProductRequest) (*dto.ProductResponse, error) {
	product, err := s.productDomainSvc.CreateProduct(ctx, req.Name, req.Description, req.SKU, req.Price, req.Currency, req.CategoryID)
	if err != nil {
		return nil, err
	}

	// Publish domain event
	s.eventBus.Publish("product.created", &events.ProductCreatedEvent{
		ProductID: product.ID,
		Name:      product.Name,
		SKU:       product.SKU,
		Price:     product.Price,
		CreatedAt: product.CreatedAt,
	})

	return mappers.ProductToResponse(product), nil
}

func (s *ProductApplicationService) GetProduct(ctx context.Context, productID uuid.UUID) (*dto.ProductResponse, error) {
	product, err := s.productRepo.GetByID(ctx, productID)
	if err != nil {
		return nil, err
	}

	return mappers.ProductToResponse(product), nil
}

func (s *ProductApplicationService) UpdateProduct(ctx context.Context, productID uuid.UUID, req *dto.UpdateProductRequest) (*dto.ProductResponse, error) {
	product, err := s.productRepo.GetByID(ctx, productID)
	if err != nil {
		return nil, err
	}

	mappers.UpdateProductRequestToEntity(req, product)

	if err := s.productRepo.Update(ctx, product); err != nil {
		return nil, err
	}

	// Publish domain event
	s.eventBus.Publish("product.updated", &events.ProductUpdatedEvent{
		ProductID: product.ID,
		Name:      product.Name,
		SKU:       product.SKU,
		Price:     product.Price,
		UpdatedAt: product.UpdatedAt,
	})

	return mappers.ProductToResponse(product), nil
}

func (s *ProductApplicationService) DeleteProduct(ctx context.Context, productID uuid.UUID) error {
	if err := s.productRepo.Delete(ctx, productID); err != nil {
		return err
	}

	// Publish domain event
	s.eventBus.Publish("product.deleted", &events.ProductDeletedEvent{
		ProductID: productID,
		DeletedAt: time.Now(),
	})

	return nil
}

func (s *ProductApplicationService) ListProducts(ctx context.Context, page, limit int, search string) (*dto.ProductListResponse, error) {
	offset := (page - 1) * limit

	products, err := s.productRepo.List(ctx, limit, offset, search)
	if err != nil {
		return nil, err
	}

	total, err := s.productRepo.Count(ctx, search)
	if err != nil {
		return nil, err
	}

	productResponses := mappers.ProductsToResponse(products)

	return &dto.ProductListResponse{
		Products: productResponses,
		Total:    total,
		Page:     page,
		Limit:    limit,
	}, nil
}

func (s *ProductApplicationService) ListProductsByCategory(ctx context.Context, categoryID uuid.UUID, page, limit int) (*dto.ProductListResponse, error) {
	offset := (page - 1) * limit

	products, err := s.productRepo.ListByCategory(ctx, categoryID, limit, offset)
	if err != nil {
		return nil, err
	}

	productResponses := mappers.ProductsToResponse(products)

	return &dto.ProductListResponse{
		Products: productResponses,
		Total:    int64(len(productResponses)), // Note: This is a simplified count
		Page:     page,
		Limit:    limit,
	}, nil
}

func (s *ProductApplicationService) UpdateProductPrice(ctx context.Context, productID uuid.UUID, req *dto.UpdateProductPriceRequest) (*dto.ProductResponse, error) {
	if err := s.productDomainSvc.ChangeProductPrice(ctx, productID, req.Price); err != nil {
		return nil, err
	}

	product, err := s.productRepo.GetByID(ctx, productID)
	if err != nil {
		return nil, err
	}

	return mappers.ProductToResponse(product), nil
}

func (s *ProductApplicationService) UpdateProductStatus(ctx context.Context, productID uuid.UUID, req *dto.UpdateProductStatusRequest) (*dto.ProductResponse, error) {
	product, err := s.productRepo.GetByID(ctx, productID)
	if err != nil {
		return nil, err
	}

	oldStatus := product.Status

	switch req.Status {
	case "active":
		err = s.productDomainSvc.ActivateProduct(ctx, productID)
	case "inactive":
		err = s.productDomainSvc.DeactivateProduct(ctx, productID)
	case "draft":
		err = s.productDomainSvc.SetProductAsDraft(ctx, productID)
	default:
		return nil, errors.New("invalid status")
	}

	if err != nil {
		return nil, err
	}

	// Get updated product
	product, err = s.productRepo.GetByID(ctx, productID)
	if err != nil {
		return nil, err
	}

	// Publish status change event
	s.eventBus.Publish("product.status_changed", &events.ProductStatusChangedEvent{
		ProductID: productID,
		OldStatus: oldStatus,
		NewStatus: product.Status,
		ChangedAt: time.Now(),
	})

	return mappers.ProductToResponse(product), nil
}
