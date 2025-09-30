package seeding

import (
	"context"
	"fmt"

	"go-apps/internal/modules/users/dto"
	"go-apps/internal/modules/users/model"
	"go-apps/internal/modules/users/service"

	"github.com/sirupsen/logrus"
)

// Seeder handles database seeding operations
type Seeder struct {
	roleService *service.RoleService
	logger      *logrus.Logger
}

// NewSeeder creates a new seeder instance
func NewSeeder(roleService *service.RoleService, logger *logrus.Logger) *Seeder {
	return &Seeder{
		roleService: roleService,
		logger:      logger,
	}
}

// SeedInitialRoles seeds the database with initial roles
func (s *Seeder) SeedInitialRoles(ctx context.Context) error {
	s.logger.Info("Starting initial roles seeding...")

	// Define initial roles
	initialRoles := []struct {
		Name        string
		Description string
		Permissions []string
		IsActive    bool
	}{
		{
			Name:        "super_admin",
			Description: "Super Administrator with full system access",
			Permissions: []string{
				"users.manage",
				"users.create",
				"users.read",
				"users.update",
				"users.delete",
				"roles.manage",
				"roles.create",
				"roles.read",
				"roles.update",
				"roles.delete",
				"system.admin",
				"system.config",
				"system.logs",
			},
			IsActive: true,
		},
		{
			Name:        "admin",
			Description: "Administrator with management access",
			Permissions: []string{
				"users.manage",
				"users.create",
				"users.read",
				"users.update",
				"roles.manage",
				"roles.create",
				"roles.read",
				"roles.update",
			},
			IsActive: true,
		},
		{
			Name:        "manager",
			Description: "Manager with limited administrative access",
			Permissions: []string{
				"users.read",
				"users.update",
				"roles.read",
			},
			IsActive: true,
		},
		{
			Name:        "user",
			Description: "Regular user with basic access",
			Permissions: []string{
				"profile.read",
				"profile.update",
			},
			IsActive: true,
		},
		{
			Name:        "guest",
			Description: "Guest user with read-only access",
			Permissions: []string{
				"profile.read",
			},
			IsActive: true,
		},
	}

	// Create roles
	createdCount := 0
	for _, roleData := range initialRoles {
		// Check if role already exists
		exists, err := s.roleService.CheckNameExists(ctx, roleData.Name)
		if err != nil {
			return fmt.Errorf("failed to check if role %s exists: %w", roleData.Name, err)
		}

		if exists {
			s.logger.Info("Role already exists, skipping", "role", roleData.Name)
			continue
		}

		// Create role
		permissions := model.Permissions(roleData.Permissions)
		createReq := &dto.CreateRoleRequest{
			Name:        roleData.Name,
			Description: &roleData.Description,
			Permissions: &permissions,
			IsActive:    &roleData.IsActive,
		}

		role, err := s.roleService.CreateRole(ctx, createReq)
		if err != nil {
			return fmt.Errorf("failed to create role %s: %w", roleData.Name, err)
		}

		s.logger.Info("Created role", "role", role.Name, "id", role.ID)
		createdCount++
	}

	s.logger.Info("Initial roles seeding completed", "created", createdCount)
	return nil
}

// SeedInitialUsers seeds the database with initial users (optional)
func (s *Seeder) SeedInitialUsers(ctx context.Context, userService *service.UserService) error {
	s.logger.Info("Starting initial users seeding...")

	// Define initial users
	initialUsers := []struct {
		Email     string
		FirstName string
		LastName  string
		RoleNames []string
	}{
		{
			Email:     "admin@example.com",
			FirstName: "System",
			LastName:  "Administrator",
			RoleNames: []string{"super_admin"},
		},
		{
			Email:     "manager@example.com",
			FirstName: "John",
			LastName:  "Manager",
			RoleNames: []string{"manager"},
		},
	}

	// Get all roles for assignment
	roles, err := s.roleService.GetActiveRoles(ctx)
	if err != nil {
		return fmt.Errorf("failed to get active roles: %w", err)
	}

	// Create a map for quick role lookup
	roleMap := make(map[string]uint)
	for _, role := range roles {
		roleMap[role.Name] = role.ID
	}

	createdCount := 0
	for _, userData := range initialUsers {
		// Check if user already exists
		exists, err := userService.CheckEmailExists(ctx, userData.Email)
		if err != nil {
			return fmt.Errorf("failed to check if user %s exists: %w", userData.Email, err)
		}

		if exists {
			s.logger.Info("User already exists, skipping", "email", userData.Email)
			continue
		}

		// Get role IDs
		var roleIDs []uint
		for _, roleName := range userData.RoleNames {
			if roleID, exists := roleMap[roleName]; exists {
				roleIDs = append(roleIDs, roleID)
			}
		}

		// Create user
		createReq := &dto.CreateUserRequest{
			Email:     userData.Email,
			FirstName: userData.FirstName,
			LastName:  userData.LastName,
			RoleIDs:   roleIDs,
		}

		user, err := userService.CreateUser(ctx, createReq)
		if err != nil {
			return fmt.Errorf("failed to create user %s: %w", userData.Email, err)
		}

		s.logger.Info("Created user", "email", user.Email, "id", user.ID)
		createdCount++
	}

	s.logger.Info("Initial users seeding completed", "created", createdCount)
	return nil
}

// SeedAll seeds all initial data
func (s *Seeder) SeedAll(ctx context.Context, userService *service.UserService) error {
	s.logger.Info("Starting complete database seeding...")

	// Seed roles first
	if err := s.SeedInitialRoles(ctx); err != nil {
		return fmt.Errorf("failed to seed initial roles: %w", err)
	}

	// Seed users
	if err := s.SeedInitialUsers(ctx, userService); err != nil {
		return fmt.Errorf("failed to seed initial users: %w", err)
	}

	s.logger.Info("Complete database seeding finished successfully")
	return nil
}
