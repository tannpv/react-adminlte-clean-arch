package handler

import (
	"net/http"
	"strconv"

	"go-apps/internal/modules/users/dto"
	"go-apps/internal/modules/users/service"
	"go-apps/internal/shared/dto"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// UserHandler handles HTTP requests for users
type UserHandler struct {
	userService *service.UserService
	logger      *logrus.Logger
}

// NewUserHandler creates a new user handler
func NewUserHandler(userService *service.UserService, logger *logrus.Logger) *UserHandler {
	return &UserHandler{
		userService: userService,
		logger:      logger,
	}
}

// CreateUser handles POST /users
func (h *UserHandler) CreateUser(c *gin.Context) {
	var req dto.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.WithError(err).Error("Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	user, err := h.userService.CreateUser(c.Request.Context(), &req)
	if err != nil {
		h.logger.WithError(err).Error("Failed to create user")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, user)
}

// GetUser handles GET /users/:id
func (h *UserHandler) GetUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	user, err := h.userService.GetUser(c.Request.Context(), uint(id))
	if err != nil {
		h.logger.WithError(err).Error("Failed to get user")
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

// GetUserByEmail handles GET /users/email/:email
func (h *UserHandler) GetUserByEmail(c *gin.Context) {
	email := c.Param("email")
	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email parameter is required"})
		return
	}

	user, err := h.userService.GetUserByEmail(c.Request.Context(), email)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get user by email")
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

// GetUsers handles GET /users
func (h *UserHandler) GetUsers(c *gin.Context) {
	req := shared_dto.ParsePaginationFromQuery(
		c.Query("page"),
		c.Query("limit"),
		c.Query("search"),
		c.Query("sort_by"),
		c.Query("sort_order"),
	)

	users, err := h.userService.GetUsers(c.Request.Context(), req)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get users")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, users)
}

// GetActiveUsers handles GET /users/active
func (h *UserHandler) GetActiveUsers(c *gin.Context) {
	users, err := h.userService.GetActiveUsers(c.Request.Context())
	if err != nil {
		h.logger.WithError(err).Error("Failed to get active users")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, users)
}

// GetUserCount handles GET /users/count
func (h *UserHandler) GetUserCount(c *gin.Context) {
	count, err := h.userService.GetUserCount(c.Request.Context())
	if err != nil {
		h.logger.WithError(err).Error("Failed to get user count")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": count})
}

// GetUsersByRole handles GET /users/role/:roleName
func (h *UserHandler) GetUsersByRole(c *gin.Context) {
	roleName := c.Param("roleName")
	if roleName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Role name parameter is required"})
		return
	}

	users, err := h.userService.GetUsersByRole(c.Request.Context(), roleName)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get users by role")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, users)
}

// CheckEmailExists handles GET /users/exists/:email
func (h *UserHandler) CheckEmailExists(c *gin.Context) {
	email := c.Param("email")
	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email parameter is required"})
		return
	}

	exists, err := h.userService.CheckEmailExists(c.Request.Context(), email)
	if err != nil {
		h.logger.WithError(err).Error("Failed to check email existence")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"exists": exists})
}

// UpdateUser handles PATCH /users/:id
func (h *UserHandler) UpdateUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req dto.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.WithError(err).Error("Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	user, err := h.userService.UpdateUser(c.Request.Context(), uint(id), &req)
	if err != nil {
		h.logger.WithError(err).Error("Failed to update user")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

// AssignRoles handles PATCH /users/:id/roles
func (h *UserHandler) AssignRoles(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req dto.AssignRolesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.WithError(err).Error("Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	user, err := h.userService.AssignRoles(c.Request.Context(), uint(id), &req)
	if err != nil {
		h.logger.WithError(err).Error("Failed to assign roles")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

// DeleteUser handles DELETE /users/:id
func (h *UserHandler) DeleteUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	if err := h.userService.DeleteUser(c.Request.Context(), uint(id)); err != nil {
		h.logger.WithError(err).Error("Failed to delete user")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
