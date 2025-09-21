package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/southern-martin/go-microservice/internal/domain/entities"
)

type CategoryRepository interface {
	Create(ctx context.Context, category *entities.Category) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Category, error)
	GetByName(ctx context.Context, name string) (*entities.Category, error)
	Update(ctx context.Context, category *entities.Category) error
	Delete(ctx context.Context, id uuid.UUID) error
	List(ctx context.Context, limit, offset int, search string) ([]*entities.Category, error)
	Count(ctx context.Context, search string) (int64, error)
	ListByParent(ctx context.Context, parentID *uuid.UUID) ([]*entities.Category, error)
	GetTree(ctx context.Context) ([]*entities.Category, error)
}
