package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"

	"go-apps/internal/config"
	"go-apps/internal/infrastructure/database"
	"go-apps/internal/infrastructure/logger"
	"go-apps/internal/modules/users/model"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Parse command line flags
	var (
		action = flag.String("action", "up", "Migration action: up, down, or reset")
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

	// Run migration based on action
	switch *action {
	case "up":
		if err := runMigrations(db, logger); err != nil {
			logger.Fatal("Failed to run migrations", "error", err)
		}
		logger.Info("Migrations completed successfully")
	case "down":
		if err := rollbackMigrations(db, logger); err != nil {
			logger.Fatal("Failed to rollback migrations", "error", err)
		}
		logger.Info("Migrations rolled back successfully")
	case "reset":
		if err := resetMigrations(db, logger); err != nil {
			logger.Fatal("Failed to reset migrations", "error", err)
		}
		logger.Info("Migrations reset successfully")
	default:
		logger.Fatal("Invalid action. Use: up, down, or reset")
	}
}

func runMigrations(db *database.Database, logger *logger.Logger) error {
	logger.Info("Running database migrations...")

	// Auto-migrate all models
	models := []interface{}{
		&model.User{},
		&model.Role{},
	}

	for _, model := range models {
		if err := db.Migrate(model); err != nil {
			return fmt.Errorf("failed to migrate %T: %w", model, err)
		}
		logger.Info("Migrated model", "model", fmt.Sprintf("%T", model))
	}

	return nil
}

func rollbackMigrations(db *database.Database, logger *logger.Logger) error {
	logger.Info("Rolling back database migrations...")
	
	// Note: GORM doesn't have built-in rollback support
	// In production, you'd use a proper migration tool like golang-migrate
	logger.Warn("Rollback not implemented - GORM auto-migrate doesn't support rollbacks")
	logger.Info("Consider using golang-migrate for production rollback support")
	
	return nil
}

func resetMigrations(db *database.Database, logger *logger.Logger) error {
	logger.Info("Resetting database migrations...")
	
	// Drop all tables (use with caution!)
	if err := db.Exec("DROP TABLE IF EXISTS user_roles").Error; err != nil {
		return fmt.Errorf("failed to drop user_roles table: %w", err)
	}
	
	if err := db.Exec("DROP TABLE IF EXISTS users").Error; err != nil {
		return fmt.Errorf("failed to drop users table: %w", err)
	}
	
	if err := db.Exec("DROP TABLE IF EXISTS roles").Error; err != nil {
		return fmt.Errorf("failed to drop roles table: %w", err)
	}
	
	logger.Info("Tables dropped successfully")
	
	// Re-run migrations
	return runMigrations(db, logger)
}

func showHelp() {
	fmt.Println("Database Migration Tool")
	fmt.Println("Usage: go run cmd/migrate/main.go [options]")
	fmt.Println("")
	fmt.Println("Options:")
	fmt.Println("  -action string")
	fmt.Println("        Migration action: up, down, or reset (default: up)")
	fmt.Println("  -help")
	fmt.Println("        Show this help message")
	fmt.Println("")
	fmt.Println("Examples:")
	fmt.Println("  go run cmd/migrate/main.go -action=up")
	fmt.Println("  go run cmd/migrate/main.go -action=reset")
}
