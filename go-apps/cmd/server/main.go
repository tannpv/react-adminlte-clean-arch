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
	"go-apps/internal/infrastructure/database"
	"go-apps/internal/infrastructure/logger"
	"go-apps/internal/modules/users/handler"
	"go-apps/internal/modules/users/model"
	"go-apps/internal/modules/users/repository"
	"go-apps/internal/modules/users/service"

	"github.com/gin-gonic/gin"
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

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	roleRepo := repository.NewRoleRepository(db)

	// Initialize services
	userService := service.NewUserService(userRepo, roleRepo, logger)
	roleService := service.NewRoleService(roleRepo, logger)

	// Initialize handlers
	userHandler := handler.NewUserHandler(userService, logger)
	roleHandler := handler.NewRoleHandler(roleService, logger)

	// Setup router
	router := setupRouter(userHandler, roleHandler)

	// Create server
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      router,
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

func setupRouter(userHandler *handler.UserHandler, roleHandler *handler.RoleHandler) *gin.Engine {
	// Set Gin mode based on environment
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// Middleware
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "go-apps-api",
			"time":    time.Now().UTC(),
		})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// User routes
		users := v1.Group("/users")
		{
			users.POST("", userHandler.CreateUser)
			users.GET("", userHandler.GetUsers)
			users.GET("/active", userHandler.GetActiveUsers)
			users.GET("/count", userHandler.GetUserCount)
			users.GET("/email/:email", userHandler.GetUserByEmail)
			users.GET("/role/:roleName", userHandler.GetUsersByRole)
			users.GET("/exists/:email", userHandler.CheckEmailExists)
			users.GET("/:id", userHandler.GetUser)
			users.PATCH("/:id", userHandler.UpdateUser)
			users.PATCH("/:id/roles", userHandler.AssignRoles)
			users.DELETE("/:id", userHandler.DeleteUser)
		}

		// Role routes
		roles := v1.Group("/roles")
		{
			roles.POST("", roleHandler.CreateRole)
			roles.GET("", roleHandler.GetRoles)
			roles.GET("/active", roleHandler.GetActiveRoles)
			roles.GET("/count", roleHandler.GetRoleCount)
			roles.GET("/permission/:permission", roleHandler.GetRolesByPermission)
			roles.GET("/name/:name", roleHandler.GetRoleByName)
			roles.GET("/exists/:name", roleHandler.CheckNameExists)
			roles.GET("/:id", roleHandler.GetRole)
			roles.PATCH("/:id", roleHandler.UpdateRole)
			roles.DELETE("/:id", roleHandler.DeleteRole)
		}
	}

	return router
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
