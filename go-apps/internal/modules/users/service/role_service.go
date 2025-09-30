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

// RoleService handles role business logic
type RoleService struct {
	roleRepo repository.RoleRepository
	logger   *logrus.Logger
}

// NewRoleService creates a new role service
func NewRoleService(roleRepo repository.RoleRepository, logger *logrus.Logger) *RoleService {
	return &RoleService{
		roleRepo: roleRepo,
		logger:   logger,
	}
}

// CreateRole creates a new role
func (s *RoleService) CreateRole(ctx context.Context, req *dto.CreateRoleRequest) (*dto.RoleResponse, error) {
	// Check if role with same name already exists
	exists, err := s.roleRepo.ExistsByName(ctx, req.Name)
	if err != nil {
		s.logger.WithError(err).Error("Failed to check role name existence")
		return nil, fmt.Errorf("failed to check role name existence: %w", err)
	}
	if exists {
		return nil, fmt.Errorf("role with name %s already exists", req.Name)
	}

	// Create role model
	role := &model.Role{
		Name:        req.Name,
		Description: req.Description,
		IsActive:    true,
		Permissions: req.Permissions,
		Metadata:    req.Metadata,
	}

	// Set optional fields
	if req.IsActive != nil {
		role.IsActive = *req.IsActive
	}

	// Create role
	if err := s.roleRepo.Create(ctx, role); err != nil {
		s.logger.WithError(err).Error("Failed to create role")
		return nil, fmt.Errorf("failed to create role: %w", err)
	}

	s.logger.WithField("role_id", role.ID).Info("Role created successfully")
	return dto.ToRoleResponse(role), nil
}

// GetRole gets a role by ID
func (s *RoleService) GetRole(ctx context.Context, id uint) (*dto.RoleResponse, error) {
	role, err := s.roleRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return dto.ToRoleResponse(role), nil
}

// GetRoleByName gets a role by name
func (s *RoleService) GetRoleByName(ctx context.Context, name string) (*dto.RoleResponse, error) {
	role, err := s.roleRepo.GetByName(ctx, name)
	if err != nil {
		return nil, err
	}
	return dto.ToRoleResponse(role), nil
}

// GetRoles gets roles with pagination
func (s *RoleService) GetRoles(ctx context.Context, req *sharedDto.PaginationRequest) (*sharedDto.PaginationResponse[*dto.RoleResponse], error) {
	var roles []*model.Role
	var total int64
	var err error

	if req.Search != "" {
		roles, total, err = s.roleRepo.Search(ctx, req.Search, req.GetLimit(), req.GetOffset())
	} else {
		roles, err = s.roleRepo.GetAll(ctx, req.GetLimit(), req.GetOffset())
		if err == nil {
			total, err = s.roleRepo.Count(ctx)
		}
	}

	if err != nil {
		s.logger.WithError(err).Error("Failed to get roles")
		return nil, fmt.Errorf("failed to get roles: %w", err)
	}

	roleResponses := dto.ToRoleResponses(roles)
	return sharedDto.NewPaginationResponse(roleResponses, total, req.Page, req.Limit), nil
}

// UpdateRole updates a role
func (s *RoleService) UpdateRole(ctx context.Context, id uint, req *dto.UpdateRoleRequest) (*dto.RoleResponse, error) {
	role, err := s.roleRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Check if name is being updated and if it conflicts
	if req.Name != nil && *req.Name != role.Name {
		exists, err := s.roleRepo.ExistsByName(ctx, *req.Name)
		if err != nil {
			return nil, fmt.Errorf("failed to check role name existence: %w", err)
		}
		if exists {
			return nil, fmt.Errorf("role with name %s already exists", *req.Name)
		}
		role.Name = *req.Name
	}

	// Update fields
	if req.Description != nil {
		role.Description = req.Description
	}
	if req.IsActive != nil {
		role.IsActive = *req.IsActive
	}
	if req.Permissions != nil {
		role.Permissions = req.Permissions
	}
	if req.Metadata != nil {
		role.Metadata = req.Metadata
	}

	// Update role
	if err := s.roleRepo.Update(ctx, role); err != nil {
		s.logger.WithError(err).Error("Failed to update role")
		return nil, fmt.Errorf("failed to update role: %w", err)
	}

	s.logger.WithField("role_id", role.ID).Info("Role updated successfully")
	return dto.ToRoleResponse(role), nil
}

// DeleteRole deletes a role
func (s *RoleService) DeleteRole(ctx context.Context, id uint) error {
	// Check if role exists
	_, err := s.roleRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if err := s.roleRepo.Delete(ctx, id); err != nil {
		s.logger.WithError(err).Error("Failed to delete role")
		return fmt.Errorf("failed to delete role: %w", err)
	}

	s.logger.WithField("role_id", id).Info("Role deleted successfully")
	return nil
}

// GetActiveRoles gets all active roles
func (s *RoleService) GetActiveRoles(ctx context.Context) ([]*dto.RoleResponse, error) {
	roles, err := s.roleRepo.GetActive(ctx)
	if err != nil {
		s.logger.WithError(err).Error("Failed to get active roles")
		return nil, fmt.Errorf("failed to get active roles: %w", err)
	}
	return dto.ToRoleResponses(roles), nil
}

// GetRolesByPermission gets roles by permission
func (s *RoleService) GetRolesByPermission(ctx context.Context, permission string) ([]*dto.RoleResponse, error) {
	roles, err := s.roleRepo.GetByPermission(ctx, permission)
	if err != nil {
		s.logger.WithError(err).Error("Failed to get roles by permission")
		return nil, fmt.Errorf("failed to get roles by permission: %w", err)
	}
	return dto.ToRoleResponses(roles), nil
}

// GetRoleCount gets the total count of roles
func (s *RoleService) GetRoleCount(ctx context.Context) (int64, error) {
	return s.roleRepo.Count(ctx)
}

// CheckNameExists checks if a role name exists
func (s *RoleService) CheckNameExists(ctx context.Context, name string) (bool, error) {
	return s.roleRepo.ExistsByName(ctx, name)
}
