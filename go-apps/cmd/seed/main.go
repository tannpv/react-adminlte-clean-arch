package main

import (
	"context"
	"flag"
	"fmt"
	"log"

	"go-apps/internal/config"
	"go-apps/internal/infrastructure/database"
	"go-apps/internal/infrastructure/logger"
	"go-apps/internal/modules/users/dto"
	"go-apps/internal/modules/users/model"
	"go-apps/internal/modules/users/repository"
	"go-apps/internal/modules/users/service"

	"github.com/sirupsen/logrus"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Parse command line flags
	var (
		action = flag.String("action", "seed", "Seeding action: seed, clear, or reset")
		help   = flag.Bool("help", false, "Show help")
	)
	flag.Parse()

	if *help {
		showHelp()
		return
	}

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize logger
	logger := logger.New(cfg.LogLevel)

	// Initialize database
	db, err := database.New(cfg.Database)
	if err != nil {
		logger.Fatal("Failed to connect to database", "error", err)
	}
	defer db.Close()

	// Initialize repositories and services
	roleRepo := repository.NewRoleRepository(db.DB)
	logrusLogger := logrus.New()
	roleService := service.NewRoleService(roleRepo, logrusLogger)

	// Run seeding based on action
	switch *action {
	case "seed":
		if err := seedInitialData(roleService, logger); err != nil {
			logger.Fatal("Failed to seed initial data", "error", err)
		}
		logger.Info("Initial data seeded successfully")
	case "clear":
		if err := clearSeedData(db, logger); err != nil {
			logger.Fatal("Failed to clear seed data", "error", err)
		}
		logger.Info("Seed data cleared successfully")
	case "reset":
		if err := resetSeedData(db, roleService, logger); err != nil {
			logger.Fatal("Failed to reset seed data", "error", err)
		}
		logger.Info("Seed data reset successfully")
	default:
		logger.Fatal("Invalid action. Use: seed, clear, or reset")
	}
}

func seedInitialData(roleService *service.RoleService, logger *logger.Logger) error {
	logger.Info("Seeding initial data...")

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
	for _, roleData := range initialRoles {
		// Check if role already exists
		exists, err := roleService.CheckNameExists(context.Background(), roleData.Name)
		if err != nil {
			return fmt.Errorf("failed to check if role %s exists: %w", roleData.Name, err)
		}

		if exists {
			logger.Info("Role already exists, skipping", "role", roleData.Name)
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

		role, err := roleService.CreateRole(context.Background(), createReq)
		if err != nil {
			return fmt.Errorf("failed to create role %s: %w", roleData.Name, err)
		}

		logger.Info("Created role", "role", role.Name, "id", role.ID)
	}

	return nil
}

func clearSeedData(db *database.Database, logger *logger.Logger) error {
	logger.Info("Clearing seed data...")

	// Clear user_roles relationships first
	if err := db.Exec("DELETE FROM user_roles").Error; err != nil {
		return fmt.Errorf("failed to clear user_roles: %w", err)
	}

	// Clear users
	if err := db.Exec("DELETE FROM users").Error; err != nil {
		return fmt.Errorf("failed to clear users: %w", err)
	}

	// Clear roles
	if err := db.Exec("DELETE FROM roles").Error; err != nil {
		return fmt.Errorf("failed to clear roles: %w", err)
	}

	logger.Info("Seed data cleared successfully")
	return nil
}

func resetSeedData(db *database.Database, roleService *service.RoleService, logger *logger.Logger) error {
	logger.Info("Resetting seed data...")

	// Clear existing data
	if err := clearSeedData(db, logger); err != nil {
		return err
	}

	// Re-seed data
	return seedInitialData(roleService, logger)
}

func showHelp() {
	fmt.Println("Database Seeding Tool")
	fmt.Println("Usage: go run cmd/seed/main.go [options]")
	fmt.Println("")
	fmt.Println("Options:")
	fmt.Println("  -action string")
	fmt.Println("        Seeding action: seed, clear, or reset (default: seed)")
	fmt.Println("  -help")
	fmt.Println("        Show this help message")
	fmt.Println("")
	fmt.Println("Examples:")
	fmt.Println("  go run cmd/seed/main.go -action=seed")
	fmt.Println("  go run cmd/seed/main.go -action=clear")
	fmt.Println("  go run cmd/seed/main.go -action=reset")
}
