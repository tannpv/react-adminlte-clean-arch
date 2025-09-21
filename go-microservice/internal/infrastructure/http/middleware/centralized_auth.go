package middleware

import (
	"bytes"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// AuthServiceClient handles communication with centralized auth service
type AuthServiceClient struct {
	BaseURL    string
	HTTPClient *http.Client
}

// TokenValidationResponse represents the response from auth service
type TokenValidationResponse struct {
	Valid  bool   `json:"valid"`
	UserID string `json:"user_id,omitempty"`
	Email  string `json:"email,omitempty"`
	Error  string `json:"error,omitempty"`
}

// NewAuthServiceClient creates a new auth service client
func NewAuthServiceClient(baseURL string) *AuthServiceClient {
	return &AuthServiceClient{
		BaseURL: baseURL,
		HTTPClient: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

// ValidateToken validates token with centralized auth service
func (c *AuthServiceClient) ValidateToken(token string) (*TokenValidationResponse, error) {
	reqBody := map[string]string{"token": token}
	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", c.BaseURL+"/api/v1/auth/validate", bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var validationResp TokenValidationResponse
	if err := json.NewDecoder(resp.Body).Decode(&validationResp); err != nil {
		return nil, err
	}

	return &validationResp, nil
}

// CentralizedAuthMiddleware creates middleware for centralized authentication
func CentralizedAuthMiddleware(authClient *AuthServiceClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header required",
			})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid authorization header format",
			})
			c.Abort()
			return
		}

		// Validate token with auth service
		validationResp, err := authClient.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to validate token",
			})
			c.Abort()
			return
		}

		if !validationResp.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid token",
			})
			c.Abort()
			return
		}

		// Add user info to context
		c.Set("user_id", validationResp.UserID)
		c.Set("email", validationResp.Email)

		c.Next()
	}
}
