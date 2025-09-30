package router

import (
	"net/http"
	"time"

	"go-apps/internal/middleware"
	"go-apps/internal/modules/carrier/router"
	"go-apps/internal/modules/users/handler"
	usersRouter "go-apps/internal/modules/users/router"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// Router handles all application routing
type Router struct {
	usersRouter   *usersRouter.UsersRouter
	carrierRouter *router.CarrierRouter
	logger        *logrus.Logger
}

// NewRouter creates a new router instance
func NewRouter(
	userHandler *handler.UserHandler,
	roleHandler *handler.RoleHandler,
	logger *logrus.Logger,
) *Router {
	return &Router{
		usersRouter:   usersRouter.NewUsersRouter(userHandler, roleHandler),
		carrierRouter: router.NewCarrierRouter(),
		logger:        logger,
	}
}

// SetupRoutes configures all application routes
func (r *Router) SetupRoutes() *gin.Engine {
	// Set Gin mode based on environment
	gin.SetMode(gin.ReleaseMode)

	// Create router
	router := gin.New()

	// Apply middleware
	r.setupMiddleware(router)

	// Setup health check
	r.setupHealthCheck(router)

	// Setup API routes
	r.setupAPIRoutes(router)

	return router
}

// setupMiddleware configures all middleware
func (r *Router) setupMiddleware(router *gin.Engine) {
	// Core middleware
	router.Use(middleware.LoggerMiddleware(r.logger))
	router.Use(middleware.RecoveryMiddleware(r.logger))
	router.Use(middleware.RequestIDMiddleware())
	router.Use(middleware.SecurityHeadersMiddleware())

	// CORS middleware (enable in development)
	router.Use(middleware.CORSMiddleware())

	// Rate limiting (placeholder)
	router.Use(middleware.RateLimitMiddleware())
}

// setupHealthCheck configures health check endpoint
func (r *Router) setupHealthCheck(router *gin.Engine) {
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"service":   "go-apps-api",
			"version":   "1.0.0",
			"timestamp": time.Now().UTC(),
			"uptime":    time.Since(startTime).String(),
		})
	})

	// Additional health endpoints
	router.GET("/health/ready", r.healthReady)
	router.GET("/health/live", r.healthLive)
}

// setupAPIRoutes configures all API routes
func (r *Router) setupAPIRoutes(router *gin.Engine) {
	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Setup module-specific routes
		r.usersRouter.SetupRoutes(v1)
		r.carrierRouter.SetupRoutes(v1)

		// Future modules can be added here:
		// r.customerRouter.SetupRoutes(v1)
		// r.pricingRouter.SetupRoutes(v1)
	}
}

// healthReady checks if the service is ready to serve requests
func (r *Router) healthReady(c *gin.Context) {
	// TODO: Add database connectivity check
	// TODO: Add external service dependency checks
	
	c.JSON(http.StatusOK, gin.H{
		"status": "ready",
		"checks": gin.H{
			"database": "ok",
			"redis":    "ok",
		},
	})
}

// healthLive checks if the service is alive
func (r *Router) healthLive(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "alive",
		"time":   time.Now().UTC(),
	})
}

// startTime tracks when the application started
var startTime = time.Now()
