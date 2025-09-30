package users

import (
	"fmt"

	"go-apps/internal/infrastructure/database"
	"go-apps/internal/modules/users/handler"
	"go-apps/internal/modules/users/model"
	"go-apps/internal/modules/users/repository"
	"go-apps/internal/modules/users/router"
	"go-apps/internal/modules/users/service"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// UsersModule implements the Module interface for user management
type UsersModule struct {
	name           string
	userRepo       *repository.UserRepository
	roleRepo       *repository.RoleRepository
	userService    *service.UserService
	roleService    *service.RoleService
	userHandler    *handler.UserHandler
	roleHandler    *handler.RoleHandler
	usersRouter    *router.UsersRouter
	logger         *logrus.Logger
}

// NewUsersModule creates a new users module
func NewUsersModule() *UsersModule {
	return &UsersModule{
		name: "users",
	}
}

// Name returns the module name
func (m *UsersModule) Name() string {
	return m.name
}

// Initialize sets up the users module with its dependencies
func (m *UsersModule) Initialize(db *database.Database, logger *logrus.Logger) error {
	m.logger = logger
	
	m.logger.Info("Initializing users module...")

	// Initialize repositories
	m.userRepo = repository.NewUserRepository(db)
	m.roleRepo = repository.NewRoleRepository(db)
	m.logger.Info("Repositories initialized")

	// Initialize services
	m.userService = service.NewUserService(m.userRepo, m.roleRepo, logger)
	m.roleService = service.NewRoleService(m.roleRepo, logger)
	m.logger.Info("Services initialized")

	// Initialize handlers
	m.userHandler = handler.NewUserHandler(m.userService, logger)
	m.roleHandler = handler.NewRoleHandler(m.roleService, logger)
	m.logger.Info("Handlers initialized")

	// Initialize router
	m.usersRouter = router.NewUsersRouter(m.userHandler, m.roleHandler)
	m.logger.Info("Router initialized")

	m.logger.Info("Users module initialized successfully")
	return nil
}

// GetHandlers returns the handlers provided by this module
func (m *UsersModule) GetHandlers() []Handler {
	return []Handler{
		&UserHandlerWrapper{m.userHandler},
		&RoleHandlerWrapper{m.roleHandler},
	}
}

// SetupRoutes configures the module's routes
func (m *UsersModule) SetupRoutes(router *gin.RouterGroup) error {
	m.logger.Info("Setting up users module routes...")
	m.usersRouter.SetupRoutes(router)
	m.logger.Info("Users module routes configured")
	return nil
}

// HealthCheck performs module-specific health checks
func (m *UsersModule) HealthCheck() error {
	// TODO: Add database connectivity checks
	// TODO: Add service health checks
	m.logger.Debug("Users module health check passed")
	return nil
}

// GetUserService returns the user service (for external access)
func (m *UsersModule) GetUserService() *service.UserService {
	return m.userService
}

// GetRoleService returns the role service (for external access)
func (m *UsersModule) GetRoleService() *service.RoleService {
	return m.roleService
}

// GetUserHandler returns the user handler (for external access)
func (m *UsersModule) GetUserHandler() *handler.UserHandler {
	return m.userHandler
}

// GetRoleHandler returns the role handler (for external access)
func (m *UsersModule) GetRoleHandler() *handler.RoleHandler {
	return m.roleHandler
}

// GetModels returns the database models for this module
func (m *UsersModule) GetModels() []interface{} {
	return []interface{}{
		&model.User{},
		&model.Role{},
	}
}

// RunMigrations runs database migrations for this module
func (m *UsersModule) RunMigrations(db *database.Database) error {
	m.logger.Info("Running migrations for users module...")

	models := m.GetModels()
	for _, model := range models {
		if err := db.Migrate(model); err != nil {
			return fmt.Errorf("failed to migrate %T: %w", model, err)
		}
		m.logger.Info("Migrated model", "model", fmt.Sprintf("%T", model))
	}

	m.logger.Info("Users module migrations completed successfully")
	return nil
}

// Handler interface implementations
type UserHandlerWrapper struct {
	*handler.UserHandler
}

func (h *UserHandlerWrapper) GetName() string {
	return "user"
}

func (h *UserHandlerWrapper) GetType() string {
	return "user"
}

type RoleHandlerWrapper struct {
	*handler.RoleHandler
}

func (h *RoleHandlerWrapper) GetName() string {
	return "role"
}

func (h *RoleHandlerWrapper) GetType() string {
	return "role"
}
