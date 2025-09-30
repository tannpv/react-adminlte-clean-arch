package container

import (
	"fmt"

	"go-apps/internal/infrastructure/database"
	"go-apps/internal/modules/carrier"
	"go-apps/internal/modules/users"
	"go-apps/internal/router"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// Container manages all application modules
type Container struct {
	modules []Module
	logger  *logrus.Logger
}

// Module represents a domain module
type Module interface {
	Name() string
	Initialize(db *database.Database, logger *logrus.Logger) error
	GetHandlers() []Handler
	SetupRoutes(router *gin.RouterGroup) error
	HealthCheck() error
	GetModels() []interface{}
	RunMigrations(db *database.Database) error
}

// Handler represents a module handler
type Handler interface {
	GetName() string
	GetType() string
}

// NewContainer creates a new application container
func NewContainer(logger *logrus.Logger) *Container {
	return &Container{
		modules: make([]Module, 0),
		logger:  logger,
	}
}

// RegisterModule registers a module with the container
func (c *Container) RegisterModule(module Module) {
	c.modules = append(c.modules, module)
	c.logger.Info("Module registered", "name", module.Name())
}

// RunMigrations runs migrations for all registered modules
func (c *Container) RunMigrations(db *database.Database) error {
	c.logger.Info("Running migrations for all modules...")

	for _, module := range c.modules {
		c.logger.Info("Running migrations for module", "name", module.Name())
		if err := module.RunMigrations(db); err != nil {
			return fmt.Errorf("failed to run migrations for module %s: %w", module.Name(), err)
		}
		c.logger.Info("Module migrations completed", "name", module.Name())
	}

	c.logger.Info("All module migrations completed successfully")
	return nil
}

// InitializeModules initializes all registered modules
func (c *Container) InitializeModules(db *database.Database) error {
	c.logger.Info("Initializing all modules...")

	for _, module := range c.modules {
		c.logger.Info("Initializing module", "name", module.Name())
		if err := module.Initialize(db, c.logger); err != nil {
			return fmt.Errorf("failed to initialize module %s: %w", module.Name(), err)
		}
		c.logger.Info("Module initialized successfully", "name", module.Name())
	}

	c.logger.Info("All modules initialized successfully")
	return nil
}

// SetupRoutes configures routes for all modules
func (c *Container) SetupRoutes() *gin.Engine {
	c.logger.Info("Setting up application routes...")

	// Create main router
	appRouter := router.NewRouter(c.getUserHandlers(), c.getRoleHandlers(), c.logger)
	ginRouter := appRouter.SetupRoutes()

	// Setup module-specific routes
	v1 := ginRouter.Group("/api/v1")
	for _, module := range c.modules {
		c.logger.Info("Setting up routes for module", "name", module.Name())
		if err := module.SetupRoutes(v1); err != nil {
			c.logger.Error("Failed to setup routes for module", "name", module.Name(), "error", err)
		}
	}

	c.logger.Info("All routes configured successfully")
	return ginRouter
}

// HealthCheck performs health checks for all modules
func (c *Container) HealthCheck() error {
	c.logger.Info("Performing health checks for all modules...")

	for _, module := range c.modules {
		c.logger.Info("Health checking module", "name", module.Name())
		if err := module.HealthCheck(); err != nil {
			return fmt.Errorf("health check failed for module %s: %w", module.Name(), err)
		}
	}

	c.logger.Info("All module health checks passed")
	return nil
}

// GetModule returns a module by name
func (c *Container) GetModule(name string) Module {
	for _, module := range c.modules {
		if module.Name() == name {
			return module
		}
	}
	return nil
}

// GetUsersModule returns the users module
func (c *Container) GetUsersModule() *users.UsersModule {
	if module := c.GetModule("users"); module != nil {
		if usersModule, ok := module.(*users.UsersModule); ok {
			return usersModule
		}
	}
	return nil
}

// GetCarrierModule returns the carrier module
func (c *Container) GetCarrierModule() *carrier.CarrierModule {
	if module := c.GetModule("carrier"); module != nil {
		if carrierModule, ok := module.(*carrier.CarrierModule); ok {
			return carrierModule
		}
	}
	return nil
}

// getUserHandlers extracts user handlers from modules
func (c *Container) getUserHandlers() []*users.UserHandlerWrapper {
	var handlers []*users.UserHandlerWrapper
	for _, module := range c.modules {
		for _, handler := range module.GetHandlers() {
			if userHandler, ok := handler.(*users.UserHandlerWrapper); ok {
				handlers = append(handlers, userHandler)
			}
		}
	}
	return handlers
}

// getRoleHandlers extracts role handlers from modules
func (c *Container) getRoleHandlers() []*users.RoleHandlerWrapper {
	var handlers []*users.RoleHandlerWrapper
	for _, module := range c.modules {
		for _, handler := range module.GetHandlers() {
			if roleHandler, ok := handler.(*users.RoleHandlerWrapper); ok {
				handlers = append(handlers, roleHandler)
			}
		}
	}
	return handlers
}
