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

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/southern-martin/go-microservice/internal/application/services"
	"github.com/southern-martin/go-microservice/internal/domain/entities"
	"github.com/southern-martin/go-microservice/internal/domain/events"
	domainServices "github.com/southern-martin/go-microservice/internal/domain/services"
	"github.com/southern-martin/go-microservice/internal/infrastructure/config"
	"github.com/southern-martin/go-microservice/internal/infrastructure/http/handlers"
	"github.com/southern-martin/go-microservice/internal/infrastructure/http/middleware"
	postgresRepo "github.com/southern-martin/go-microservice/internal/infrastructure/persistence/postgres"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Initialize logger
	logger, err := initLogger(cfg.Logging)
	if err != nil {
		log.Fatal("Failed to initialize logger:", err)
	}
	defer logger.Sync()

	// Initialize database
	db, err := initDatabase(cfg.Database)
	if err != nil {
		logger.Fatal("Failed to initialize database", zap.Error(err))
	}

	// Initialize event bus
	eventBus := events.NewDomainEventBus()

	// Initialize repositories
	userRepo := postgresRepo.NewUserRepository(db)
	productRepo := postgresRepo.NewProductRepository(db)

	// Initialize domain services
	userDomainSvc := domainServices.NewUserDomainService(userRepo)
	productDomainSvc := domainServices.NewProductDomainService(productRepo)

	// Initialize application services
	userAppSvc := services.NewUserApplicationService(
		userRepo,
		userDomainSvc,
		eventBus,
		cfg.JWT.Secret,
		cfg.JWT.ExpiresIn,
	)
	productAppSvc := services.NewProductApplicationService(
		productRepo,
		productDomainSvc,
		eventBus,
	)

	// Initialize handlers
	userHandler := handlers.NewUserHandler(userAppSvc)
	productHandler := handlers.NewProductHandler(productAppSvc)

	// Setup event handlers
	setupEventHandlers(eventBus, logger)

	// Initialize router
	router := setupRouter(cfg, userHandler, productHandler)

	// Start server
	startServer(cfg, router, logger)
}

func initLogger(cfg config.LoggingConfig) (*zap.Logger, error) {
	var config zap.Config

	if cfg.Format == "json" {
		config = zap.NewProductionConfig()
	} else {
		config = zap.NewDevelopmentConfig()
	}

	config.Level = zap.NewAtomicLevelAt(zap.InfoLevel)
	if cfg.Level == "debug" {
		config.Level = zap.NewAtomicLevelAt(zap.DebugLevel)
	}

	return config.Build()
}

func initDatabase(cfg config.DatabaseConfig) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.Name, cfg.SSLMode,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Auto-migrate entities
	if err := db.AutoMigrate(
		&entities.User{},
		&entities.Product{},
		&entities.Category{},
	); err != nil {
		return nil, err
	}

	return db, nil
}

func setupRouter(
	cfg *config.Config,
	userHandler *handlers.UserHandler,
	productHandler *handlers.ProductHandler,
) *gin.Engine {
	gin.SetMode(cfg.Server.GinMode)
	router := gin.New()

	// Middleware
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(middleware.CORSMiddleware())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// API routes
	api := router.Group("/api/v1")
	{
		// Auth routes (no auth required)
		auth := api.Group("/auth")
		{
			auth.POST("/login", userHandler.Login)
			auth.POST("/register", userHandler.CreateUser)
		}

		// Protected routes
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware(cfg.JWT.Secret))
		{
			// User routes
			users := protected.Group("/users")
			{
				users.GET("", userHandler.ListUsers)
				users.GET("/:id", userHandler.GetUser)
				users.PUT("/:id", userHandler.UpdateUser)
				users.DELETE("/:id", userHandler.DeleteUser)
			}

			// Product routes
			products := protected.Group("/products")
			{
				products.GET("", productHandler.ListProducts)
				products.GET("/:id", productHandler.GetProduct)
				products.POST("", productHandler.CreateProduct)
				products.PUT("/:id", productHandler.UpdateProduct)
				products.DELETE("/:id", productHandler.DeleteProduct)
			}
		}
	}

	return router
}

func setupEventHandlers(eventBus events.EventBus, logger *zap.Logger) {
	// User event handlers
	eventBus.Subscribe("user.created", func(event *events.UserCreatedEvent) {
		logger.Info("User created",
			zap.String("user_id", event.UserID.String()),
			zap.String("email", event.Email),
		)
		// Add any additional logic here (e.g., send welcome email)
	})

	eventBus.Subscribe("user.updated", func(event *events.UserUpdatedEvent) {
		logger.Info("User updated",
			zap.String("user_id", event.UserID.String()),
			zap.String("email", event.Email),
		)
	})

	eventBus.Subscribe("user.deleted", func(event *events.UserDeletedEvent) {
		logger.Info("User deleted",
			zap.String("user_id", event.UserID.String()),
		)
	})
}

func startServer(cfg *config.Config, router *gin.Engine, logger *zap.Logger) {
	srv := &http.Server{
		Addr:    ":" + cfg.Server.Port,
		Handler: router,
	}

	// Start server in a goroutine
	go func() {
		logger.Info("Starting server", zap.String("port", cfg.Server.Port))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Failed to start server", zap.Error(err))
		}
	}()

	// Wait for interrupt signal to gracefully shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logger.Info("Shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Fatal("Server forced to shutdown", zap.Error(err))
	}

	logger.Info("Server exited")
}
