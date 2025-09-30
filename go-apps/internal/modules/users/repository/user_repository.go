package repository

import (
	"context"
	"fmt"

	"go-apps/internal/modules/users/model"

	"gorm.io/gorm"
)

// UserRepository interface defines user repository operations
type UserRepository interface {
	Create(ctx context.Context, user *model.User) error
	GetByID(ctx context.Context, id uint) (*model.User, error)
	GetByEmail(ctx context.Context, email string) (*model.User, error)
	Update(ctx context.Context, user *model.User) error
	Delete(ctx context.Context, id uint) error
	GetAll(ctx context.Context, limit, offset int) ([]*model.User, error)
	GetActive(ctx context.Context) ([]*model.User, error)
	GetByRole(ctx context.Context, roleName string) ([]*model.User, error)
	Count(ctx context.Context) (int64, error)
	ExistsByEmail(ctx context.Context, email string) (bool, error)
	Search(ctx context.Context, query string, limit, offset int) ([]*model.User, int64, error)
}

// userRepository implements UserRepository interface
type userRepository struct {
	db *gorm.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

// Create creates a new user
func (r *userRepository) Create(ctx context.Context, user *model.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

// GetByID gets a user by ID
func (r *userRepository) GetByID(ctx context.Context, id uint) (*model.User, error) {
	var user model.User
	err := r.db.WithContext(ctx).Preload("Roles").First(&user, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}
	return &user, nil
}

// GetByEmail gets a user by email
func (r *userRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	err := r.db.WithContext(ctx).Preload("Roles").Where("email = ?", email).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}
	return &user, nil
}

// Update updates a user
func (r *userRepository) Update(ctx context.Context, user *model.User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

// Delete deletes a user
func (r *userRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&model.User{}, id).Error
}

// GetAll gets all users with pagination
func (r *userRepository) GetAll(ctx context.Context, limit, offset int) ([]*model.User, error) {
	var users []*model.User
	err := r.db.WithContext(ctx).Preload("Roles").
		Limit(limit).Offset(offset).
		Order("first_name ASC").
		Find(&users).Error
	return users, err
}

// GetActive gets all active users
func (r *userRepository) GetActive(ctx context.Context) ([]*model.User, error) {
	var users []*model.User
	err := r.db.WithContext(ctx).Preload("Roles").
		Where("is_active = ?", true).
		Order("first_name ASC").
		Find(&users).Error
	return users, err
}

// GetByRole gets users by role name
func (r *userRepository) GetByRole(ctx context.Context, roleName string) ([]*model.User, error) {
	var users []*model.User
	err := r.db.WithContext(ctx).Preload("Roles").
		Joins("JOIN user_roles ON users.id = user_roles.user_id").
		Joins("JOIN roles ON user_roles.role_id = roles.id").
		Where("roles.name = ?", roleName).
		Find(&users).Error
	return users, err
}

// Count gets the total count of users
func (r *userRepository) Count(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&model.User{}).Count(&count).Error
	return count, err
}

// ExistsByEmail checks if a user exists by email
func (r *userRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&model.User{}).Where("email = ?", email).Count(&count).Error
	return count > 0, err
}

// Search searches users by query
func (r *userRepository) Search(ctx context.Context, query string, limit, offset int) ([]*model.User, int64, error) {
	var users []*model.User
	var total int64

	searchQuery := r.db.WithContext(ctx).Model(&model.User{}).
		Where("first_name ILIKE ? OR last_name ILIKE ? OR email ILIKE ?",
			"%"+query+"%", "%"+query+"%", "%"+query+"%")

	// Get total count
	if err := searchQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get results
	err := searchQuery.Preload("Roles").
		Limit(limit).Offset(offset).
		Order("first_name ASC").
		Find(&users).Error

	return users, total, err
}
