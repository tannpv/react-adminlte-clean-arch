package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/southern-martin/go-microservice/internal/domain/entities"
)

type UserRepository interface {
	Create(ctx context.Context, user *entities.User) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.User, error)
	GetByEmail(ctx context.Context, email string) (*entities.User, error)
	Update(ctx context.Context, user *entities.User) error
	Delete(ctx context.Context, id uuid.UUID) error
	List(ctx context.Context, limit, offset int, search string) ([]*entities.User, error)
	Count(ctx context.Context, search string) (int64, error)
}
