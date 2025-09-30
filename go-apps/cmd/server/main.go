package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go-apps/internal/config"
	"go-apps/internal/container"
	"go-apps/internal/infrastructure/database"
	"go-apps/internal/infrastructure/logger"
	"go-apps/internal/modules/carrier"
	"go-apps/internal/modules/users"
	"go-apps/internal/modules/users/model"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
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

	// Run database migrations
	if err := runMigrations(db, logger); err != nil {
		logger.Fatal("Failed to run migrations", "error", err)
	}

	// Initialize application container
	appContainer := container.NewContainer(logger)

	// Register modules
	appContainer.RegisterModule(users.NewUsersModule())
	appContainer.RegisterModule(carrier.NewCarrierModule())

	// Initialize all modules
	if err := appContainer.InitializeModules(db); err != nil {
		logger.Fatal("Failed to initialize modules", "error", err)
	}

	// Setup routes
	ginRouter := appContainer.SetupRoutes()

	// Perform health checks
	if err := appContainer.HealthCheck(); err != nil {
		logger.Fatal("Health check failed", "error", err)
	}

	// Create server
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      ginRouter,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		logger.Info("Starting server", "port", cfg.Port, "env", cfg.Env)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Failed to start server", "error", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	// Give outstanding requests 30 seconds to complete
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logger.Fatal("Server forced to shutdown", "error", err)
	}

	logger.Info("Server exited")
}

// runMigrations runs database migrations
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
