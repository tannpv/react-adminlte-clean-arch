package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/southern-martin/go-microservice/internal/domain/entities"
)

type ProductRepository interface {
	Create(ctx context.Context, product *entities.Product) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Product, error)
	GetBySKU(ctx context.Context, sku string) (*entities.Product, error)
	Update(ctx context.Context, product *entities.Product) error
	Delete(ctx context.Context, id uuid.UUID) error
	List(ctx context.Context, limit, offset int, search string) ([]*entities.Product, error)
	Count(ctx context.Context, search string) (int64, error)
	ListByCategory(ctx context.Context, categoryID uuid.UUID, limit, offset int) ([]*entities.Product, error)
}
