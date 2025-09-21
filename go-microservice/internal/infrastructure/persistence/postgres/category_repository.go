package postgres

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/southern-martin/go-microservice/internal/domain/entities"
	"github.com/southern-martin/go-microservice/internal/domain/repositories"
	"gorm.io/gorm"
)

type CategoryRepository struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) repositories.CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) Create(ctx context.Context, category *entities.Category) error {
	return r.db.WithContext(ctx).Create(category).Error
}

func (r *CategoryRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.Category, error) {
	var category entities.Category
	err := r.db.WithContext(ctx).Preload("Parent").Preload("Children").Where("id = ?", id).First(&category).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("category not found")
		}
		return nil, err
	}
	return &category, nil
}

func (r *CategoryRepository) GetByName(ctx context.Context, name string) (*entities.Category, error) {
	var category entities.Category
	err := r.db.WithContext(ctx).Where("name = ?", name).First(&category).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("category not found")
		}
		return nil, err
	}
	return &category, nil
}

func (r *CategoryRepository) Update(ctx context.Context, category *entities.Category) error {
	return r.db.WithContext(ctx).Save(category).Error
}

func (r *CategoryRepository) Delete(ctx context.Context, id uuid.UUID) error {
	result := r.db.WithContext(ctx).Delete(&entities.Category{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("category not found")
	}
	return nil
}

func (r *CategoryRepository) List(ctx context.Context, limit, offset int, search string) ([]*entities.Category, error) {
	var categories []*entities.Category
	query := r.db.WithContext(ctx).Preload("Parent")

	if search != "" {
		query = query.Where("name ILIKE ?", "%"+search+"%")
	}

	err := query.Limit(limit).Offset(offset).Order("name ASC").Find(&categories).Error
	return categories, err
}

func (r *CategoryRepository) Count(ctx context.Context, search string) (int64, error) {
	var count int64
	query := r.db.WithContext(ctx).Model(&entities.Category{})

	if search != "" {
		query = query.Where("name ILIKE ?", "%"+search+"%")
	}

	err := query.Count(&count).Error
	return count, err
}

func (r *CategoryRepository) ListByParent(ctx context.Context, parentID *uuid.UUID) ([]*entities.Category, error) {
	var categories []*entities.Category
	query := r.db.WithContext(ctx)

	if parentID == nil {
		query = query.Where("parent_id IS NULL")
	} else {
		query = query.Where("parent_id = ?", *parentID)
	}

	err := query.Order("name ASC").Find(&categories).Error
	return categories, err
}

func (r *CategoryRepository) GetTree(ctx context.Context) ([]*entities.Category, error) {
	var categories []*entities.Category
	err := r.db.WithContext(ctx).Preload("Parent").Preload("Children").Order("name ASC").Find(&categories).Error
	return categories, err
}
