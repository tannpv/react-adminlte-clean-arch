package service

import (
	"context"
	"fmt"

	"go-apps/internal/modules/users/dto"
	"go-apps/internal/modules/users/model"
	"go-apps/internal/modules/users/repository"
	sharedDto "go-apps/internal/shared/dto"

	"github.com/sirupsen/logrus"
)

// UserService handles user business logic
type UserService struct {
	userRepo repository.UserRepository
	roleRepo repository.RoleRepository
	logger   *logrus.Logger
}

// NewUserService creates a new user service
func NewUserService(userRepo repository.UserRepository, roleRepo repository.RoleRepository, logger *logrus.Logger) *UserService {
	return &UserService{
		userRepo: userRepo,
		roleRepo: roleRepo,
		logger:   logger,
	}
}

// CreateUser creates a new user
func (s *UserService) CreateUser(ctx context.Context, req *dto.CreateUserRequest) (*dto.UserResponse, error) {
	// Check if user with same email already exists
	exists, err := s.userRepo.ExistsByEmail(ctx, req.Email)
	if err != nil {
		s.logger.WithError(err).Error("Failed to check email existence")
		return nil, fmt.Errorf("failed to check email existence: %w", err)
	}
	if exists {
		return nil, fmt.Errorf("user with email %s already exists", req.Email)
	}

	// Create user model
	user := &model.User{
		Email:           req.Email,
		FirstName:       req.FirstName,
		LastName:        req.LastName,
		Phone:           req.Phone,
		IsActive:        true,
		IsEmailVerified: false,
		DateOfBirth:     req.DateOfBirth,
		Address:         req.Address,
		Preferences:     req.Preferences,
	}

	// Set optional fields
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}
	if req.IsEmailVerified != nil {
		user.IsEmailVerified = *req.IsEmailVerified
	}

	// Assign roles if provided
	if len(req.RoleIDs) > 0 {
		roles, err := s.getRolesByIDs(ctx, req.RoleIDs)
		if err != nil {
			return nil, fmt.Errorf("failed to get roles: %w", err)
		}
		user.Roles = roles
	}

	// Create user
	if err := s.userRepo.Create(ctx, user); err != nil {
		s.logger.WithError(err).Error("Failed to create user")
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	s.logger.WithField("user_id", user.ID).Info("User created successfully")
	return dto.ToUserResponse(user), nil
}

// GetUser gets a user by ID
func (s *UserService) GetUser(ctx context.Context, id uint) (*dto.UserResponse, error) {
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return dto.ToUserResponse(user), nil
}

// GetUserByEmail gets a user by email
func (s *UserService) GetUserByEmail(ctx context.Context, email string) (*dto.UserResponse, error) {
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	return dto.ToUserResponse(user), nil
}

// GetUsers gets users with pagination
func (s *UserService) GetUsers(ctx context.Context, req *sharedDto.PaginationRequest) (*sharedDto.PaginationResponse[*dto.UserResponse], error) {
	var users []*model.User
	var total int64
	var err error

	if req.Search != "" {
		users, total, err = s.userRepo.Search(ctx, req.Search, req.GetLimit(), req.GetOffset())
	} else {
		users, err = s.userRepo.GetAll(ctx, req.GetLimit(), req.GetOffset())
		if err == nil {
			total, err = s.userRepo.Count(ctx)
		}
	}

	if err != nil {
		s.logger.WithError(err).Error("Failed to get users")
		return nil, fmt.Errorf("failed to get users: %w", err)
	}

	userResponses := dto.ToUserResponses(users)
	return sharedDto.NewPaginationResponse(userResponses, total, req.Page, req.Limit), nil
}

// UpdateUser updates a user
func (s *UserService) UpdateUser(ctx context.Context, id uint, req *dto.UpdateUserRequest) (*dto.UserResponse, error) {
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Check if email is being updated and if it conflicts
	if req.Email != nil && *req.Email != user.Email {
		exists, err := s.userRepo.ExistsByEmail(ctx, *req.Email)
		if err != nil {
			return nil, fmt.Errorf("failed to check email existence: %w", err)
		}
		if exists {
			return nil, fmt.Errorf("user with email %s already exists", *req.Email)
		}
		user.Email = *req.Email
	}

	// Update fields
	if req.FirstName != nil {
		user.FirstName = *req.FirstName
	}
	if req.LastName != nil {
		user.LastName = *req.LastName
	}
	if req.Phone != nil {
		user.Phone = req.Phone
	}
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}
	if req.IsEmailVerified != nil {
		user.IsEmailVerified = *req.IsEmailVerified
	}
	if req.DateOfBirth != nil {
		user.DateOfBirth = req.DateOfBirth
	}
	if req.Address != nil {
		user.Address = req.Address
	}
	if req.Preferences != nil {
		user.Preferences = req.Preferences
	}

	// Update roles if provided
	if req.RoleIDs != nil {
		roles, err := s.getRolesByIDs(ctx, req.RoleIDs)
		if err != nil {
			return nil, fmt.Errorf("failed to get roles: %w", err)
		}
		user.Roles = roles
	}

	// Update user
	if err := s.userRepo.Update(ctx, user); err != nil {
		s.logger.WithError(err).Error("Failed to update user")
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	s.logger.WithField("user_id", user.ID).Info("User updated successfully")
	return dto.ToUserResponse(user), nil
}

// DeleteUser deletes a user
func (s *UserService) DeleteUser(ctx context.Context, id uint) error {
	// Check if user exists
	_, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if err := s.userRepo.Delete(ctx, id); err != nil {
		s.logger.WithError(err).Error("Failed to delete user")
		return fmt.Errorf("failed to delete user: %w", err)
	}

	s.logger.WithField("user_id", id).Info("User deleted successfully")
	return nil
}

// AssignRoles assigns roles to a user
func (s *UserService) AssignRoles(ctx context.Context, id uint, req *dto.AssignRolesRequest) (*dto.UserResponse, error) {
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	roles, err := s.getRolesByIDs(ctx, req.RoleIDs)
	if err != nil {
		return nil, fmt.Errorf("failed to get roles: %w", err)
	}

	user.Roles = roles

	if err := s.userRepo.Update(ctx, user); err != nil {
		s.logger.WithError(err).Error("Failed to assign roles")
		return nil, fmt.Errorf("failed to assign roles: %w", err)
	}

	s.logger.WithField("user_id", user.ID).Info("Roles assigned successfully")
	return dto.ToUserResponse(user), nil
}

// GetActiveUsers gets all active users
func (s *UserService) GetActiveUsers(ctx context.Context) ([]*dto.UserResponse, error) {
	users, err := s.userRepo.GetActive(ctx)
	if err != nil {
		s.logger.WithError(err).Error("Failed to get active users")
		return nil, fmt.Errorf("failed to get active users: %w", err)
	}
	return dto.ToUserResponses(users), nil
}

// GetUsersByRole gets users by role name
func (s *UserService) GetUsersByRole(ctx context.Context, roleName string) ([]*dto.UserResponse, error) {
	users, err := s.userRepo.GetByRole(ctx, roleName)
	if err != nil {
		s.logger.WithError(err).Error("Failed to get users by role")
		return nil, fmt.Errorf("failed to get users by role: %w", err)
	}
	return dto.ToUserResponses(users), nil
}

// GetUserCount gets the total count of users
func (s *UserService) GetUserCount(ctx context.Context) (int64, error) {
	return s.userRepo.Count(ctx)
}

// CheckEmailExists checks if an email exists
func (s *UserService) CheckEmailExists(ctx context.Context, email string) (bool, error) {
	return s.userRepo.ExistsByEmail(ctx, email)
}

// getRolesByIDs gets roles by their IDs
func (s *UserService) getRolesByIDs(ctx context.Context, roleIDs []uint) ([]model.Role, error) {
	var roles []model.Role
	for _, id := range roleIDs {
		role, err := s.roleRepo.GetByID(ctx, id)
		if err != nil {
			return nil, fmt.Errorf("role with ID %d not found", id)
		}
		roles = append(roles, *role)
	}
	return roles, nil
}
