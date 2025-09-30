package router

import (
	"go-apps/internal/modules/users/handler"

	"github.com/gin-gonic/gin"
)

// UsersRouter handles user-related routes
type UsersRouter struct {
	userHandler *handler.UserHandler
	roleHandler *handler.RoleHandler
}

// NewUsersRouter creates a new users router
func NewUsersRouter(userHandler *handler.UserHandler, roleHandler *handler.RoleHandler) *UsersRouter {
	return &UsersRouter{
		userHandler: userHandler,
		roleHandler: roleHandler,
	}
}

// SetupRoutes sets up all user-related routes
func (r *UsersRouter) SetupRoutes(router *gin.RouterGroup) {
	// User routes
	users := router.Group("/users")
	{
		users.POST("", r.userHandler.CreateUser)
		users.GET("", r.userHandler.GetUsers)
		users.GET("/active", r.userHandler.GetActiveUsers)
		users.GET("/count", r.userHandler.GetUserCount)
		users.GET("/email/:email", r.userHandler.GetUserByEmail)
		users.GET("/role/:roleName", r.userHandler.GetUsersByRole)
		users.GET("/exists/:email", r.userHandler.CheckEmailExists)
		users.GET("/:id", r.userHandler.GetUser)
		users.PATCH("/:id", r.userHandler.UpdateUser)
		users.PATCH("/:id/roles", r.userHandler.AssignRoles)
		users.DELETE("/:id", r.userHandler.DeleteUser)
	}

	// Role routes
	roles := router.Group("/roles")
	{
		roles.POST("", r.roleHandler.CreateRole)
		roles.GET("", r.roleHandler.GetRoles)
		roles.GET("/active", r.roleHandler.GetActiveRoles)
		roles.GET("/count", r.roleHandler.GetRoleCount)
		roles.GET("/permission/:permission", r.roleHandler.GetRolesByPermission)
		roles.GET("/name/:name", r.roleHandler.GetRoleByName)
		roles.GET("/exists/:name", r.roleHandler.CheckNameExists)
		roles.GET("/:id", r.roleHandler.GetRole)
		roles.PATCH("/:id", r.roleHandler.UpdateRole)
		roles.DELETE("/:id", r.roleHandler.DeleteRole)
	}
}
