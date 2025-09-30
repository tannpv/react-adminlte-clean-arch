package repository

import (
	"context"
	"fmt"

	"go-apps/internal/modules/users/model"

	"gorm.io/gorm"
)

// RoleRepository interface defines role repository operations
type RoleRepository interface {
	Create(ctx context.Context, role *model.Role) error
	GetByID(ctx context.Context, id uint) (*model.Role, error)
	GetByName(ctx context.Context, name string) (*model.Role, error)
	Update(ctx context.Context, role *model.Role) error
	Delete(ctx context.Context, id uint) error
	GetAll(ctx context.Context, limit, offset int) ([]*model.Role, error)
	GetActive(ctx context.Context) ([]*model.Role, error)
	GetByPermission(ctx context.Context, permission string) ([]*model.Role, error)
	Count(ctx context.Context) (int64, error)
	ExistsByName(ctx context.Context, name string) (bool, error)
	Search(ctx context.Context, query string, limit, offset int) ([]*model.Role, int64, error)
}

// roleRepository implements RoleRepository interface
type roleRepository struct {
	db *gorm.DB
}

// NewRoleRepository creates a new role repository
func NewRoleRepository(db *gorm.DB) RoleRepository {
	return &roleRepository{db: db}
}

// Create creates a new role
func (r *roleRepository) Create(ctx context.Context, role *model.Role) error {
	return r.db.WithContext(ctx).Create(role).Error
}

// GetByID gets a role by ID
func (r *roleRepository) GetByID(ctx context.Context, id uint) (*model.Role, error) {
	var role model.Role
	err := r.db.WithContext(ctx).First(&role, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("role not found")
		}
		return nil, err
	}
	return &role, nil
}

// GetByName gets a role by name
func (r *roleRepository) GetByName(ctx context.Context, name string) (*model.Role, error) {
	var role model.Role
	err := r.db.WithContext(ctx).Where("name = ?", name).First(&role).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("role not found")
		}
		return nil, err
	}
	return &role, nil
}

// Update updates a role
func (r *roleRepository) Update(ctx context.Context, role *model.Role) error {
	return r.db.WithContext(ctx).Save(role).Error
}

// Delete deletes a role
func (r *roleRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&model.Role{}, id).Error
}

// GetAll gets all roles with pagination
func (r *roleRepository) GetAll(ctx context.Context, limit, offset int) ([]*model.Role, error) {
	var roles []*model.Role
	err := r.db.WithContext(ctx).
		Limit(limit).Offset(offset).
		Order("name ASC").
		Find(&roles).Error
	return roles, err
}

// GetActive gets all active roles
func (r *roleRepository) GetActive(ctx context.Context) ([]*model.Role, error) {
	var roles []*model.Role
	err := r.db.WithContext(ctx).
		Where("is_active = ?", true).
		Order("name ASC").
		Find(&roles).Error
	return roles, err
}

// GetByPermission gets roles by permission
func (r *roleRepository) GetByPermission(ctx context.Context, permission string) ([]*model.Role, error) {
	var roles []*model.Role
	err := r.db.WithContext(ctx).
		Where("JSON_CONTAINS(permissions, ?)", fmt.Sprintf(`"%s"`, permission)).
		Find(&roles).Error
	return roles, err
}

// Count gets the total count of roles
func (r *roleRepository) Count(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&model.Role{}).Count(&count).Error
	return count, err
}

// ExistsByName checks if a role exists by name
func (r *roleRepository) ExistsByName(ctx context.Context, name string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&model.Role{}).Where("name = ?", name).Count(&count).Error
	return count > 0, err
}

// Search searches roles by query
func (r *roleRepository) Search(ctx context.Context, query string, limit, offset int) ([]*model.Role, int64, error) {
	var roles []*model.Role
	var total int64

	searchQuery := r.db.WithContext(ctx).Model(&model.Role{}).
		Where("name ILIKE ? OR description ILIKE ?", "%"+query+"%", "%"+query+"%")

	// Get total count
	if err := searchQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get results
	err := searchQuery.
		Limit(limit).Offset(offset).
		Order("name ASC").
		Find(&roles).Error

	return roles, total, err
}
