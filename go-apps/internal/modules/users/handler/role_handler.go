package handler

import (
	"net/http"
	"strconv"

	"go-apps/internal/modules/users/dto"
	"go-apps/internal/modules/users/service"
	sharedDto "go-apps/internal/shared/dto"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// RoleHandler handles HTTP requests for roles
type RoleHandler struct {
	roleService *service.RoleService
	logger      *logrus.Logger
}

// NewRoleHandler creates a new role handler
func NewRoleHandler(roleService *service.RoleService, logger *logrus.Logger) *RoleHandler {
	return &RoleHandler{
		roleService: roleService,
		logger:      logger,
	}
}

// CreateRole handles POST /roles
func (h *RoleHandler) CreateRole(c *gin.Context) {
	var req dto.CreateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.WithError(err).Error("Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	role, err := h.roleService.CreateRole(c.Request.Context(), &req)
	if err != nil {
		h.logger.WithError(err).Error("Failed to create role")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, role)
}

// GetRole handles GET /roles/:id
func (h *RoleHandler) GetRole(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID"})
		return
	}

	role, err := h.roleService.GetRole(c.Request.Context(), uint(id))
	if err != nil {
		h.logger.WithError(err).Error("Failed to get role")
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, role)
}

// GetRoleByName handles GET /roles/name/:name
func (h *RoleHandler) GetRoleByName(c *gin.Context) {
	name := c.Param("name")
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name parameter is required"})
		return
	}

	role, err := h.roleService.GetRoleByName(c.Request.Context(), name)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get role by name")
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, role)
}

// GetRoles handles GET /roles
func (h *RoleHandler) GetRoles(c *gin.Context) {
	req := sharedDto.ParsePaginationFromQuery(
		c.Query("page"),
		c.Query("limit"),
		c.Query("search"),
		c.Query("sort_by"),
		c.Query("sort_order"),
	)

	roles, err := h.roleService.GetRoles(c.Request.Context(), req)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get roles")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, roles)
}

// GetActiveRoles handles GET /roles/active
func (h *RoleHandler) GetActiveRoles(c *gin.Context) {
	roles, err := h.roleService.GetActiveRoles(c.Request.Context())
	if err != nil {
		h.logger.WithError(err).Error("Failed to get active roles")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, roles)
}

// GetRoleCount handles GET /roles/count
func (h *RoleHandler) GetRoleCount(c *gin.Context) {
	count, err := h.roleService.GetRoleCount(c.Request.Context())
	if err != nil {
		h.logger.WithError(err).Error("Failed to get role count")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": count})
}

// GetRolesByPermission handles GET /roles/permission/:permission
func (h *RoleHandler) GetRolesByPermission(c *gin.Context) {
	permission := c.Param("permission")
	if permission == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Permission parameter is required"})
		return
	}

	roles, err := h.roleService.GetRolesByPermission(c.Request.Context(), permission)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get roles by permission")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, roles)
}

// CheckNameExists handles GET /roles/exists/:name
func (h *RoleHandler) CheckNameExists(c *gin.Context) {
	name := c.Param("name")
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name parameter is required"})
		return
	}

	exists, err := h.roleService.CheckNameExists(c.Request.Context(), name)
	if err != nil {
		h.logger.WithError(err).Error("Failed to check name existence")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"exists": exists})
}

// UpdateRole handles PATCH /roles/:id
func (h *RoleHandler) UpdateRole(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID"})
		return
	}

	var req dto.UpdateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.WithError(err).Error("Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	role, err := h.roleService.UpdateRole(c.Request.Context(), uint(id), &req)
	if err != nil {
		h.logger.WithError(err).Error("Failed to update role")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, role)
}

// DeleteRole handles DELETE /roles/:id
func (h *RoleHandler) DeleteRole(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID"})
		return
	}

	if err := h.roleService.DeleteRole(c.Request.Context(), uint(id)); err != nil {
		h.logger.WithError(err).Error("Failed to delete role")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
