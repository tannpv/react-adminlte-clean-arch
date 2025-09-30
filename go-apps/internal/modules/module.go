package modules

import (
	"go-apps/internal/infrastructure/database"
	"go-apps/internal/modules/users/handler"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// Module represents a domain module
type Module interface {
	// Name returns the module name
	Name() string
	
	// Initialize sets up the module with its dependencies
	Initialize(db *database.Database, logger *logrus.Logger) error
	
	// GetHandlers returns the handlers provided by this module
	GetHandlers() []Handler
	
	// SetupRoutes configures the module's routes
	SetupRoutes(router *gin.RouterGroup) error
	
	// HealthCheck performs module-specific health checks
	HealthCheck() error
}

// Handler represents a module handler
type Handler interface {
	// GetName returns the handler name
	GetName() string
	
	// GetType returns the handler type (e.g., "user", "role")
	GetType() string
}

// UserHandlerWrapper wraps the user handler to implement Handler interface
type UserHandlerWrapper struct {
	*handler.UserHandler
}

func (h *UserHandlerWrapper) GetName() string {
	return "user"
}

func (h *UserHandlerWrapper) GetType() string {
	return "user"
}

// RoleHandlerWrapper wraps the role handler to implement Handler interface
type RoleHandlerWrapper struct {
	*handler.RoleHandler
}

func (h *RoleHandlerWrapper) GetName() string {
	return "role"
}

func (h *RoleHandlerWrapper) GetType() string {
	return "role"
}
